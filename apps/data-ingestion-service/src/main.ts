import * as fs from 'fs';
import * as path from 'path';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  const downloadsDir = path.join(process.cwd(), 'downloads');

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Data Ingestion Service API')
    .setDescription('APIs for data ingestion, processing, and storage')
    .setVersion('1.0')
    .addTag('data-ingestion')
    .addTag('data')
    .addTag('files')
    .addTag('search')
    .addTag('debug')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');

  await app.listen(port, () => {
    console.log(
      `Data Ingestion Service is running on: http://localhost:${port}`,
    );
  });
}

bootstrap();
