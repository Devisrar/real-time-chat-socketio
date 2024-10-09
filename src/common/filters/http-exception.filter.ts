import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);  // Using NestJS Logger

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus ? exception.getStatus() : 500;
    const message = exception.message || 'Internal server error';
    const errorDetails = exception.getResponse ? exception.getResponse() : null;

    // Log error with additional details using built-in logger
    this.logger.error(
      `HTTP Status: ${status} Error Message: ${message}`,  // Main error message
      JSON.stringify(errorDetails),                       // Additional error details (if available)
      `${request.method} ${request.url}`,                 // HTTP method and URL
    );

    // Respond to client
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
