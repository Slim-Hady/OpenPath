import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(request: Request & { requestId?: string }, response: Response, next: NextFunction): void {
    const incoming = request.headers['x-request-id'];
    const requestId =
      typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 80
        ? incoming
        : randomUUID();
    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    next();
  }
}
