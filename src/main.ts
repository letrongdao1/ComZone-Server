import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Swagger
  const config = new DocumentBuilder()
    .setTitle('ComZone APIs')
    .setDescription("List of APIs for ComZone's developers.")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //Cors
  app.enableCors();

  await app.listen(3000);
}
bootstrap();
