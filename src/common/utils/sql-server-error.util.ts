import {
  BadRequestException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

interface SqlServerDriverError {
  message?: string;
  originalError?: { message?: string };
  precedingErrors?: Array<{ message?: string }>;
}

function normalizeSqlMessage(message: string): string {
  return message.replace(/^Error:\s*/i, '').trim();
}

export function getSqlServerErrorMessage(error: unknown): string | null {
  if (!(error instanceof QueryFailedError)) {
    return null;
  }

  const driverError = error.driverError as SqlServerDriverError | undefined;
  const messages: string[] = [];

  for (const precedingError of driverError?.precedingErrors ?? []) {
    if (precedingError.message) {
      messages.push(normalizeSqlMessage(precedingError.message));
    }
  }

  if (driverError?.originalError?.message) {
    messages.push(normalizeSqlMessage(driverError.originalError.message));
  }

  if (driverError?.message) {
    messages.push(normalizeSqlMessage(driverError.message));
  }

  if (error.message) {
    messages.push(normalizeSqlMessage(error.message));
  }

  const uniqueMessages = [...new Set(messages.filter(Boolean))];

  return uniqueMessages[0] ?? null;
}

export function handleStoredProcedureError(
  error: unknown,
  fallbackMessage = 'Error al ejecutar el procedimiento almacenado',
): never {
  if (error instanceof HttpException) {
    throw error;
  }

  const message = getSqlServerErrorMessage(error);

  if (message) {
    throw new BadRequestException(message);
  }

  throw new InternalServerErrorException(fallbackMessage);
}
