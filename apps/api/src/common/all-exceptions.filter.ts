import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import type { Request, Response } from 'express';
import { AppError } from './errors';

type ErrorBody = {
  statusCode: number;
  code: string;
  message: string;
  requestId?: string;
  details?: Array<{ field?: string; message: string }>;
};

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpError');

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { requestId?: string; user?: { id: string } }>();
    const requestId = request.requestId;

    let body: ErrorBody;
    if (exception instanceof ZodError) {
      body = {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: 'The request does not match the contract',
        details: exception.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      };
    } else if (exception instanceof AppError) {
      body = {
        statusCode: exception.getStatus(),
        code: exception.code,
        message: exception.message,
        details: exception.details,
      };
    } else if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const raw = exception.getResponse();
      const payload = typeof raw === 'string' ? { message: raw } : (raw as Record<string, unknown>);
      body = {
        statusCode: status,
        code: typeof payload.code === 'string' ? payload.code : httpCode(status),
        message:
          typeof payload.message === 'string' ? payload.message : exception.message || 'Request failed',
      };
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        body = {
          statusCode: HttpStatus.CONFLICT,
          code: 'CONFLICT',
          message: 'That value is already in use',
        };
      } else if (exception.code === 'P2025') {
        body = { statusCode: HttpStatus.NOT_FOUND, code: 'NOT_FOUND', message: 'Not found' };
      } else {
        body = {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          code: 'DATABASE_ERROR',
          message: 'The database rejected the request',
        };
      }
    } else {
      body = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        code: 'INTERNAL_ERROR',
        message: 'Something went wrong on our side',
      };
    }

    if (requestId) body.requestId = requestId;

    if (body.statusCode >= 500) {
      const message = exception instanceof Error ? exception.message : String(exception);
      const redacted = message
        .replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[connection-string]')
        .replace(/eyJ[A-Za-z0-9._-]+/g, '[jwt]')
        .slice(0, 240);
      this.logger.error(`${request.method} ${request.url} ${body.statusCode} ${redacted}`, {
        requestId,
        userId: request.user?.id,
      });
    }

    response.status(body.statusCode).json(body);
  }
}

function httpCode(status: number): string {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'VALIDATION_ERROR';
    case HttpStatus.UNAUTHORIZED:
      return 'UNAUTHORIZED';
    case HttpStatus.FORBIDDEN:
      return 'FORBIDDEN';
    case HttpStatus.NOT_FOUND:
      return 'NOT_FOUND';
    case HttpStatus.TOO_MANY_REQUESTS:
      return 'RATE_LIMITED';
    default:
      return status >= 500 ? 'INTERNAL_ERROR' : 'REQUEST_ERROR';
  }
}
