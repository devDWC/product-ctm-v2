// src/start-up/swagger.ts
import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import swaggerDocument from "../routes/admin/swagger.json"; // tsoa tạo ra
import swaggerPublicDocument from "../routes/public/swagger.json"; // tsoa tạo ra
import swaggerMobileDocument from "../routes/mobile/swagger.json";
export function setupSwagger(app: Express): void {
  // Serve static for public docs
  const swaggerUiOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      authAction: {
        BearerAuth: {
          name: "Authorization",
          schema: {
            type: "http",
            in: "header",
            name: "Authorization",
            scheme: "bearer",
          },
          value: "Bearer abc...token của bạn...", // <-- token mặc định
        },
      },
    },
  };

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
    swaggerUi.setup(swaggerDocument, swaggerUiOptions)
  );
  app.use(
    "/mobile/docs",
    swaggerUi.serveFiles(swaggerMobileDocument),
    swaggerUi.setup(swaggerMobileDocument)
  );
}

import { Request } from "express"; // hoặc fastify Request tùy bạn
import * as jwt from "jsonwebtoken";

export async function expressAuthentication(
  request: Request,
  securityName: string,
  scopes?: string[]
): Promise<any> {
      return {};

}
