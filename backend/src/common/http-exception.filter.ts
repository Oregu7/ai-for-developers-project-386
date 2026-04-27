import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorBody {
  code: string;
  message: string;
  details?: string;
}

const STATUS_TO_CODE: Record<number, string> = {
  400: 'VALIDATION_ERROR',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  500: 'INTERNAL_ERROR',
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: ErrorBody = {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      body = this.normalize(res, status);
    } else if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error on ${request.method} ${request.url}: ${exception.message}`,
        exception.stack,
      );
      body = { code: 'INTERNAL_ERROR', message: exception.message };
    }

    response.status(status).json({ error: body });
  }

  private normalize(res: unknown, status: number): ErrorBody {
    const fallbackCode = STATUS_TO_CODE[status] ?? 'ERROR';

    if (typeof res === 'string') {
      return { code: fallbackCode, message: res };
    }

    if (res && typeof res === 'object') {
      const obj = res as Record<string, unknown>;
      const code =
        (typeof obj.code === 'string' && obj.code) ||
        (typeof obj.error === 'string' && obj.error) ||
        fallbackCode;
      const messageRaw = obj.message ?? obj.error ?? 'Error';
      const message = Array.isArray(messageRaw)
        ? messageRaw.join('; ')
        : String(messageRaw);
      const details =
        typeof obj.details === 'string' ? obj.details : undefined;
      return { code, message, ...(details ? { details } : {}) };
    }

    return { code: fallbackCode, message: 'Error' };
  }
}
