import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalFilters(new HttpExceptionFilter());  // Register the global filter

  const logger = new Logger('Bootstrap');
  logger.log('Application is starting...');

  await app.listen(3000);
}
bootstrap();
