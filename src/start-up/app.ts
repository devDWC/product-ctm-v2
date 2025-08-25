// src/start-up/main.ts
import "reflect-metadata";
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import routesModule from "../routes/router.module";
import { setupSwagger } from "./swagger";
import { connectToMongoDb } from "../context/mongo-context/mongo-db";
import cors from "cors";
import path from "path";
import { setLanguage } from "../middleware/set-language.middleware";
import { s3Utility } from "ctm-utility";

const app = express();

app.use(
  cors({
    origin: ["http://localhost:3001"], // hoặc ['*'] nếu local dev
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-isencrypt"],
  })
);
//   s3Utility.s3Init({
//   endpoint: process.env.S3_URL || "",
//   accessKeyId: process.env.MINIO_ACCESS_KEY || "",
//   secretAccessKey: process.env.MINIO_SECRET_KEY || "",
// });


s3Utility.s3Init({
  endpoint: "https://s3-api-stg.chothongminh.com",
  accessKeyId: "zNrCdunwb3BPDJMeRRnC",
  secretAccessKey: "okePeLlMnbtpe4N7cUJMpQrr5RkgorPDORmOmvL5",
});

app.use(express.json());
app.use(setLanguage);

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
