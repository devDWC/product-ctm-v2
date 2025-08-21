import { Request, Response, NextFunction } from "express";

import baseConfig from "../config/baseConfig.json";
import { ApiResponse } from "../model/base/response.dto";
import { decryptAESwithTime } from "../shared/security/ase.security";
export const securityMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const apiRes: ApiResponse = {
    status: 200,
    message: "",
    error: null,
    isBusinessError: false,
    errorDetail: null,
    resultApi: null,
  };

  try {
    if (!baseConfig.dencrytePayload) return next();

    const isEncrypt =
      req.headers["X-isencrypt"]?.toString().toLowerCase() === "true";

    if (isEncrypt) {
      const encryptedData = req.body?.data;
      if (!encryptedData || typeof encryptedData !== "string") {
        apiRes.status = 400;
        apiRes.message = "Missing or invalid encrypted payload.";
        apiRes.error = "BadRequest";
        apiRes.isBusinessError = true;
        return res.status(400).json(apiRes);
      }

      const decrypted = decryptAESwithTime(encryptedData);
      req.body = decrypted; // Gán body đã giải mã
    }

    return next();
  } catch (error: any) {
    apiRes.status = 400;
    apiRes.message = "Decryption failed.";
    apiRes.error = error.message || "Invalid encrypted payload";
    apiRes.isBusinessError = true;
    apiRes.errorDetail = JSON.stringify(error);
    return res.status(400).json(apiRes);
  }
};
