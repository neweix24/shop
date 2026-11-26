import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const allowedOrigins = (process.env.SHOP_ALLOWED_ORIGINS ??
    "https://www.shop.neweix.com")
    .split(",")
    .map(origin => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Origin is not allowed by Shop API CORS policy."));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Accept", "Content-Type", "Idempotency-Key"],
    credentials: false,
    maxAge: 600,
  });
  app.setGlobalPrefix("api/v1/shop");

  const port = Number(process.env.PORT ?? "3100");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("PORT must be a valid TCP port.");
  }
  await app.listen(port, "0.0.0.0");
}

void bootstrap();
