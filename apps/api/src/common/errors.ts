import { HttpException, HttpStatus } from '@nestjs/common';

export class AppError extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    public readonly details?: Array<{ field?: string; message: string }>,
  ) {
    super({ code, message, details }, status);
  }

  static unauthorized(message = 'Authentication required'): AppError {
    return new AppError('UNAUTHORIZED', message, HttpStatus.UNAUTHORIZED);
  }

  static forbidden(message = 'You do not have access to this resource'): AppError {
    return new AppError('FORBIDDEN', message, HttpStatus.FORBIDDEN);
  }

  static notFound(message = 'Not found'): AppError {
    return new AppError('NOT_FOUND', message, HttpStatus.NOT_FOUND);
  }

  static conflict(code: string, message: string): AppError {
    return new AppError(code, message, HttpStatus.CONFLICT);
  }

  static limitReached(message: string, code = 'LIMIT_REACHED'): AppError {
    return new AppError(code, message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
