// src/middlewares/access-control.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ApiResponse } from "../model/base/response.dto";
import baseConfig from "../config/baseConfig.json";
import axios from "axios";

function getAccessURL() {
  return `${process.env.SSO_URL}/api/auths/checkPermission`;
}
async function checkPermission(req: Request, router: string, action: string) {
  const accessToken = req.headers.authorization;
  if (!accessToken) {
    return { allowed: false, message: "Missing token" };
  }

  try {
    const res = await axios.post(
      getAccessURL(),
      { router, action },
      {
        headers: {
          Authorization: accessToken,
          "Content-Type": "application/json",
        },
      }
    );
    return { allowed: true, data: res };
  } catch (err: any) {
    return { allowed: false, message: err.message || "SSO check failed" };
  }
}

export function accessControlMiddleware(router: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const apiRes: ApiResponse = {
      status: 403,
      message: "Access denied.",
      error: "Forbidden",
      isBusinessError: true,
      errorDetail: null,
      resultApi: null,
    };

    try {
      if (!baseConfig.enableMiddleware) {
        return next();
      }
      const res: any = await checkPermission(req, router, action);

      if (!res.allowed) {
        apiRes.message =
          res.message || "You do not have permission to perform this action.";
        return res.status(403).json(apiRes);
      }

      //Nếu cần, có thể set thêm thông tin user vào request
      (req as any)["x-userInfo"] = res.data.data || null;

      next();
    } catch (error: any) {
      apiRes.message = "Invalid or expired token.";
      apiRes.errorDetail = error.message || "Unauthorized";
      return res.status(403).json(apiRes);
    }
  };
}
