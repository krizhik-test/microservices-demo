import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle("Logging Service API")
    .setDescription("APIs for event logging, querying, and report generation")
    .setVersion("1.0")
    .addTag("logging")
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [],
    deepScanRoutes: true,
  });

  SwaggerModule.setup("api", app, document);

  const port = process.env.PORT_LOGGING || 3002;
  await app.listen(port);
  console.log(`Logging Service is running on: http://localhost:${port}`);
}

bootstrap();
