import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { join } from "node:path";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  });

  // Imágenes subidas desde /admin — servidas directo por el backend, sin
  // pasar por Next. El front las referencia como /backend/uploads/... (ver
  // front/next.config.ts) para que la URL sea igual en cliente y servidor.
  app.useStaticAssets(join(process.cwd(), "uploads"), { prefix: "/uploads" });

  app.setGlobalPrefix("api");

  // Nombre propio (no `PORT`) para no chocar con el puerto que algunas
  // herramientas de desarrollo inyectan como variable de entorno genérica
  // apuntando al front.
  await app.listen(process.env.BACK_PORT ?? 4000);
}

bootstrap();
