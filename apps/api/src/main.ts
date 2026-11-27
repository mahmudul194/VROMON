import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { NextFunction, Request, Response } from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  app.use(cookieParser());

  // Security Hardening Headers (Phase 6)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-XSS-Protection', '0');
    next();
  });

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
