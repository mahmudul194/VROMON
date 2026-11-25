import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  const webOrigin = process.env.WEB_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: [webOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  const port = Number(process.env.PORT || 4000);
  await app.listen(port);
  logger.log(`VROMON API server listening on http://localhost:${port}/api`);
}

bootstrap();
