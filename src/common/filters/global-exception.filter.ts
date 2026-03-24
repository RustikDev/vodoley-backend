import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

type RequestUser = { userId: number; email?: string };
type RequestWithMeta = Request & {
  requestId?: string;
  user?: RequestUser;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithMeta>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as { message?: string | string[] }).message ??
          'Unexpected error';

    const errorText = Array.isArray(message) ? message.join(', ') : message;
    const requestId = request.requestId ?? '-';
    const userId = request.user?.userId ?? 'anonymous';
    this.logger.error(
      `requestId=${requestId} user=${userId} ${request.method} ${request.originalUrl} ${status} ${errorText}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(status).json({
      statusCode: status,
      message,
      path: request.originalUrl,
      requestId,
      timestamp: new Date().toISOString(),
    });
  }
}
