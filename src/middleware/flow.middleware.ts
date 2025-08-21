// src/middlewares/flow.middleware.ts

import { Request, Response, NextFunction } from "express";
import { authMiddlewareEmploy } from "./auth.middleware";
import { ApiResponse } from "../model/base/response.dto";
import { securityMiddleware } from "./security.middleware";

export const flowMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // ✅ Gọi authMiddlewareEmploy trước
    // await new Promise<void>((resolve, reject) => {
    //   authMiddlewareEmploy(req, res, (err) => {
    //     if (err) reject(err);
    //     else resolve();
    //   });
    // });

    // ✅ Sau đó gọi decryptorMiddleware
    await new Promise<void>((resolve, reject) => {
      securityMiddleware(req, res, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // ✅ Nếu không có lỗi, chuyển tiếp
    next();
  } catch (error: any) {
    const apiRes: ApiResponse = {
      status: 500,
      message: "Request failed in flow middleware.",
      error: error.message || "Internal Error",
      isBusinessError: true,
      errorDetail: JSON.stringify(error),
      resultApi: null,
    };
    res.status(500).json(apiRes);
  }
};
