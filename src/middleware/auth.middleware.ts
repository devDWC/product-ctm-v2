import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ApiResponse } from "../model/base/response.dto";


interface DecodedToken extends JwtPayload {
  id: string;
  emailAddress?: string;
  privateKey: string;
  isEmloy?: boolean;
}

// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return res.status(403).json({
//         message: "Bạn không có quyền truy cập (Token không hợp lệ).",
//       });
//     }

//     const token = authHeader.split(" ")[1];

//     if (!token) {
//       return res.status(403).json({
//         message: "Token không tồn tại.",
//       });
//     }

//     try {
//       const decoded = jwt.verify(token, process.env.SECRET_KEY || "") as DecodedToken;

//       let user: any;
//       if (decoded.isEmloy) {
//         user = await employServices.getKeyPrivateUserByEmail(decoded.emailAddress || "");
//       } else {
//         user = await mgoUserServices.getKeyPrivateUserById(decoded.id);
//       }

//       if (user && user.privateKey === decoded.privateKey) {
//         (req as any).user = user;
//         return next();
//       } else {
//         return res.status(403).json({ message: "Token không hợp lệ." });
//       }
//     } catch (error) {
//       if (error instanceof jwt.TokenExpiredError) {
//         return res.status(401).json({ message: "Token đã hết hạn." });
//       } else if (error instanceof jwt.JsonWebTokenError) {
//         return res.status(403).json({ message: "Token không hợp lệ." });
//       }
//       throw error;
//     }
//   } catch (error) {
//     return res.status(500).json({ message: "Lỗi server khi xác thực token." });
//   }
// };

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
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "") as DecodedToken;
    //   const user = await employServices.getKeyPrivateEmployById(decoded.id);
      const user:any = {};
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
}