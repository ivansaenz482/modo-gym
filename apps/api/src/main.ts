import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");
  app.use(helmet());

  const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle("MODO GYM API")
    .setDescription("API de la plataforma MODO GYM: clientes, rutinas, ejercicios, nutrición, progreso e integración con IA (N8n).")
    .setVersion("2.0.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port, "0.0.0.0");
  console.log(`🚀 MODO GYM API en http://localhost:${port}/api`);
  console.log(`📚 Swagger en http://localhost:${port}/api/docs`);
}

bootstrap();
