// src/start-up/swagger.ts
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import swaggerDocument from "../routes/admin/swagger.json"; // tsoa tạo ra
import swaggerPublicDocument from "../routes/public/swagger.json"; // tsoa tạo ra
import swaggerMobileDocument from "../routes/mobile/swagger.json";
export function setupSwagger(app: Express): void {
  // Serve static for public docs
  if (process.env.NODE_ENV === "production") {
    swaggerDocument.servers = [{ url: process.env.DOMAIN || "" }];
    swaggerPublicDocument.servers = [{ url: process.env.DOMAIN || "" }];
    swaggerMobileDocument.servers = [{ url: process.env.DOMAIN || "" }];
  }

  app.use(
    "/public/docs",
    swaggerUi.serveFiles(swaggerPublicDocument),
    swaggerUi.setup(swaggerPublicDocument)
  );

  // Serve static for admin docs
  app.use(
    "/admin/docs",
    swaggerUi.serveFiles(swaggerDocument),
    swaggerUi.setup(swaggerDocument)
  );
  app.use(
    "/mobile/docs",
    swaggerUi.serveFiles(swaggerMobileDocument),
    swaggerUi.setup(swaggerMobileDocument)
  );
}
