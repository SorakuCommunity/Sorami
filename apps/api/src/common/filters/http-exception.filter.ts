import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message || exception.message;

    const error =
      typeof exceptionResponse === 'string'
        ? exception.name
        : (exceptionResponse as any).error || exception.name;

    this.logger.error(`${statusCode} ${error}: ${message}`);

    response.status(statusCode).json({
      success: false,
      statusCode,
      message: Array.isArray(message) ? message : [message],
      error,
      timestamp: new Date().toISOString(),
    });
  }
}
