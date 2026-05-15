import './dns-fix';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { env } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global middleware
  app.use(cookieParser());
  app.enableCors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Sorami API')
    .setDescription('Professional anime streaming orchestration engine by Soraku Studio')
    .setVersion('2.0')
    .addTag('anime', 'Anime discovery and metadata')
    .addTag('episode', 'Episode listing and streaming')
    .addTag('stream', 'Smart streaming orchestration')
    .addTag('metadata', 'Rich metadata intelligence')
    .addTag('providers', 'Provider management and health')
    .addTag('auth', 'Authentication and authorization')
    .addTag('users', 'User profiles and management')
    .addTag('community', 'Community comments and activity')
    .addTag('library', 'User library, favorites, and history')
    .addTag('admin', 'Admin dashboard and system management')
    .addTag('meta', 'Metadata resolution')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = env.PORT;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();