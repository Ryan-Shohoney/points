import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DefaultValidationPipeOptions } from './main.types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Points! API')
    .setDescription('A simple API to track user points')
    .setVersion('1.0')
    .addTag('User', 'All endpoints related to the Users management')
    .addTag('Balance', 'All endpoints related to Balance management')
    .build();
  SwaggerModule.setup('api', app, SwaggerModule.createDocument(app, config));
  app.useGlobalPipes(
    new ValidationPipe({
      ...DefaultValidationPipeOptions,
    }),
  );
  await app.listen(3000);
}
bootstrap().then(() => 'Success!');
