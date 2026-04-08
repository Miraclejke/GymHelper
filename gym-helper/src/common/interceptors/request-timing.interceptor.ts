import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RequestTimingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const path = request.originalUrl || request.url;

    if (path.startsWith('/api/dashboard/stream')) {
      return next.handle();
    }

    const startedAt = process.hrtime.bigint();

    return next.handle().pipe(
      map((value: unknown) => {
        const elapsedMs = Math.max(
          1,
          Number((process.hrtime.bigint() - startedAt) / BigInt(1_000_000)),
        );

        this.logger.log(`${request.method} ${path} - ${elapsedMs}ms`);

        if (path.startsWith('/api') && !response.headersSent) {
          response.setHeader('X-Elapsed-Time', `${elapsedMs}ms`);
        }

        if (
          path.startsWith('/lab1') &&
          value &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          return {
            ...(value as Record<string, unknown>),
            serverElapsedMs: elapsedMs,
          };
        }

        return value;
      }),
    );
  }
}
