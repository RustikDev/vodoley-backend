import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

type RequestUser = { userId: number; email?: string };
type RequestWithMeta = Request & {
  requestId?: string;
  user?: RequestUser;
};

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithMeta>();
    const response = http.getResponse<Response>();
    const { method, originalUrl } = request;
    const requestId = request.requestId ?? '-';
    const userId = request.user?.userId ?? 'anonymous';
    const startedAt = Date.now();

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        this.logger.log(
          `requestId=${requestId} user=${userId} ${method} ${originalUrl} ${response.statusCode} ${durationMs}ms`,
        );
      }),
    );
  }
}
