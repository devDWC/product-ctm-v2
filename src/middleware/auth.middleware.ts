import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../model/base/response.dto";
import baseConfig from "../config/baseConfig.json";

interface DecodedToken extends JwtPayload {
  id: string;
  emailAddress?: string;
  privateKey: string;
  isEmloy?: boolean;
}
export const authMiddlewareEmploy = async (
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

  if (!baseConfig.enableMiddleware) return next();

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      apiRes.status = 403;
      apiRes.message = "Access denied (Invalid token format).";
      apiRes.error = "Forbidden";
      apiRes.isBusinessError = true;
      return res.status(403).json(apiRes);
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      apiRes.status = 403;
      apiRes.message = "Token not found.";
      apiRes.error = "Forbidden";
      apiRes.isBusinessError = true;
      return res.status(403).json(apiRes);
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || ""
      ) as DecodedToken;
      //   const user = await employServices.getKeyPrivateEmployById(decoded.id);
      const user: any = {};
      (req as any).user = user;
      return next();
      if (user && user.privateKey === decoded.privateKey) {
        (req as any).user = user;
        return next();
      } else {
        apiRes.status = 403;
        apiRes.message = "Invalid token.";
        apiRes.error = "Forbidden";
        apiRes.isBusinessError = true;
        return res.status(403).json(apiRes);
      }
    } catch (error: any) {
      if (error instanceof jwt.TokenExpiredError) {
        apiRes.status = 401;
        apiRes.message = "Token has expired.";
        apiRes.error = "Unauthorized";
        apiRes.isBusinessError = true;
        return res.status(401).json(apiRes);
      } else if (error instanceof jwt.JsonWebTokenError) {
        apiRes.status = 403;
        apiRes.message = "Invalid token.";
        apiRes.error = "Forbidden";
        apiRes.isBusinessError = true;
        return res.status(403).json(apiRes);
      }

      apiRes.status = 500;
      apiRes.message = "Token verification failed.";
      apiRes.error = error.message || "Internal Server Error";
      apiRes.errorDetail = JSON.stringify(error);
      return res.status(500).json(apiRes);
    }
  } catch (error: any) {
    apiRes.status = 500;
    apiRes.message = "Internal server error during token validation.";
    apiRes.error = error.message || "Internal Server Error";
    apiRes.errorDetail = JSON.stringify(error);
    return res.status(500).json(apiRes);
  }
};
