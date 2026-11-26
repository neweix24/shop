import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { json, urlencoded } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module";

function readPort(value: string | undefined): number {
  if (!value) return 4000;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error("PORT must be an integer between 1 and 65535");
  }
  return parsed;
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }));
  app.use(json({ limit: "16kb", strict: true }));
  app.use(urlencoded({ extended: false, limit: "16kb", parameterLimit: 50 }));

  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
    forbidUnknownValues: true,
    transformOptions: { enableImplicitConversion: false },
  }));

  const origins = (process.env.SHOP_ALLOWED_ORIGINS ?? "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins.length > 0 ? origins : false,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Idempotency-Key"],
    credentials: false,
    maxAge: 600,
  });

  app.enableShutdownHooks();
  await app.listen(readPort(process.env.PORT), "0.0.0.0");
}

void bootstrap();
