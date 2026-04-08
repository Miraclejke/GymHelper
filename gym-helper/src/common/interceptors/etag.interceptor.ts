import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import type { Request, Response } from 'express';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType<string>() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (request.method !== 'GET') {
      return next.handle();
    }

    return next.handle().pipe(
      map((value: unknown) => {
        if (
          value === undefined ||
          response.headersSent ||
          response.statusCode >= 300
        ) {
          return value;
        }

        const etag = this.createEtag(value);
        response.setHeader('ETag', etag);

        const ifNoneMatch = request.headers['if-none-match'];
        if (
          typeof ifNoneMatch === 'string' &&
          this.matches(ifNoneMatch, etag)
        ) {
          response.status(304);
          return undefined as unknown;
        }

        return value;
      }),
    );
  }

  private createEtag(value: unknown) {
    const hash = createHash('sha256')
      .update(JSON.stringify(value))
      .digest('base64url');

    return `"${hash}"`;
  }

  private matches(headerValue: string, etag: string) {
    const values = headerValue.split(',').map((value) => value.trim());
    return values.includes(etag) || values.includes(`W/${etag}`);
  }
}
