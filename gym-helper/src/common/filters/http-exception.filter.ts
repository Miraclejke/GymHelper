import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';

type ErrorPayload = {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
};

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType<string>() !== 'http') {
      throw exception;
    }

    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const payload = this.toPayload(
      exception,
      request.originalUrl || request.url,
    );

    response.status(payload.statusCode).json(payload);
  }

  private toPayload(exception: unknown, path: string): ErrorPayload {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const responseBody = exception.getResponse();

      let message: string | string[] = exception.message;
      let error = this.getErrorLabel(statusCode);

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (responseBody && typeof responseBody === 'object') {
        if ('message' in responseBody) {
          const responseMessage = responseBody.message;

          if (
            typeof responseMessage === 'string' ||
            Array.isArray(responseMessage)
          ) {
            message = responseMessage;
          }
        }

        if ('error' in responseBody && typeof responseBody.error === 'string') {
          error = responseBody.error;
        }
      }

      return this.buildPayload(statusCode, message, error, path);
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return this.buildPayload(
            HttpStatus.CONFLICT,
            'A resource with the same unique field already exists.',
            'Conflict',
            path,
          );
        case 'P2025':
          return this.buildPayload(
            HttpStatus.NOT_FOUND,
            'The requested resource was not found.',
            'Not Found',
            path,
          );
        default:
          return this.buildPayload(
            HttpStatus.BAD_REQUEST,
            exception.message,
            'Bad Request',
            path,
          );
      }
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return this.buildPayload(
        HttpStatus.BAD_REQUEST,
        exception.message,
        'Bad Request',
        path,
      );
    }

    return this.buildPayload(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error.',
      'Internal Server Error',
      path,
    );
  }

  private buildPayload(
    statusCode: number,
    message: string | string[],
    error: string,
    path: string,
  ): ErrorPayload {
    return {
      statusCode,
      message,
      error,
      path,
      timestamp: new Date().toISOString(),
    };
  }

  private getErrorLabel(statusCode: number) {
    const labels: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.CONFLICT]: 'Conflict',
    };

    return labels[statusCode] ?? 'Error';
  }
}
