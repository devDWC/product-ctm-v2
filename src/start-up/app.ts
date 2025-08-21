// src/start-up/main.ts
import express from "express";
import dotenv from "dotenv";
import routesModule from "../routes/router.module";
import { setupSwagger } from "./swagger";
import { connectToMongoDb } from "../context/mongo-context/mongo-db";
import cors from "cors";
import path from "path";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3001"], // hoặc ['*'] nếu local dev
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-isencrypt"],
  })
);

app.use(express.json());

setupSwagger(app);

app.use("/api", routesModule);

app.get("/", (req, res) => {
  res.redirect("/public/docs");
});

app.get("/admin", (req, res) => {
  res.redirect("/admin/docs");
});

app.get("/mobile-app", (req, res) => {
  res.redirect("/mobile-app/docs");
});

app.use(
  "/swagger-ui",
  express.static(path.dirname(require.resolve("swagger-ui-dist/package.json")))
);

export const setupApp = async () => {
  await connectToMongoDb(); // ✅ Đảm bảo DB kết nối xong
  return app;
};
