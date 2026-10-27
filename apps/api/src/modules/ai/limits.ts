import { AppError } from '../../common/errors';

export function isAiLimitError(error: unknown): error is AppError {
  return (
    error instanceof AppError &&
    (error.code === 'AI_TOKEN_LIMIT' || error.code === 'AI_USAGE_LIMIT')
  );
}

export function isAiFallbackError(error: unknown): boolean {
  return error instanceof AppError && error.code.startsWith('AI_') && !isAiLimitError(error);
}
