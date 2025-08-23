import { Request, Response, NextFunction } from "express";

// Mở rộng interface Request để thêm field lang
declare global {
  namespace Express {
    interface Request {
      lang?: string;
    }
  }
}

export function setLanguage(req: Request, res: Response, next: NextFunction) {
  req.lang =
    req.headers["X-language"]?.toString().split(",")[0] ||
    req.headers["language"]?.toString() ||
    "en";
  next();
}
