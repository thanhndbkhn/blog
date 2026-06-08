import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const config = app.get(ConfigService);
  const port = config.get<number>('port', 4000);
  const apiPrefix = config.get<string>('apiPrefix', 'api');
  const corsOrigins = config.get<string[]>('corsOrigins', [
    'http://localhost:3000',
  ]);

  app.setGlobalPrefix(apiPrefix);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  const swagger = new DocumentBuilder()
    .setTitle('Blog API')
    .setDescription('NestJS REST API — posts, auth, upload')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swagger);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`blog-be http://localhost:${port}/${apiPrefix}/health`);
  // eslint-disable-next-line no-console
  console.log(`swagger  http://localhost:${port}/api-docs`);
}
bootstrap();
