import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Http');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const started = Date.now();
    const request = context.switchToHttp().getRequest<
      Request & { requestId?: string; user?: { id: string } }
    >();
    const response = context.switchToHttp().getResponse<Response>();
    return next.handle().pipe(
      tap({
        finalize: () => {
          this.logger.log(
            `${request.method} ${request.originalUrl} ${response.statusCode} ${Date.now() - started}ms user=${request.user?.id ?? '-'} request=${request.requestId ?? '-'}`,
          );
        },
      }),
    );
  }
}
