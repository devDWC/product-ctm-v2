// src/middleware/validateRequest.ts
import { Request, Response, NextFunction } from "express";
import xss from "xss";
import { ZodSchema } from "zod";
import { ProcessError, ExceptionError } from "../shared/utils/response.utility";
import { t } from "../locales"; // hàm translate đa ngôn ngữ

/**
 * sanitizeDeep: loại bỏ XSS cho tất cả các giá trị trong object
 */
function sanitizeDeep(obj: any): any {
  if (obj == null || typeof obj !== "object") {
    return typeof obj === "string" ? xss(obj) : obj;
  }
  if (Array.isArray(obj)) return obj.map(sanitizeDeep);
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = sanitizeDeep(v);
  }
  return out;
}

interface ValidateRequestOptions {
  source?: "body" | "query" | "params";
  errorStyle?: "issues" | "message" | "flatten";
  namespace?: string;
}

/**
 * Middleware validate request với Zod và XSS protection
 * @param schema Zod schema
 * @param options source, errorStyle, namespace
 */
export function validateRequest<T extends ZodSchema>(
  schema: T,
  options: ValidateRequestOptions = {}
) {
  const { source = "body", errorStyle = "issues", namespace } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const raw = req[source] || {};
      const clean = sanitizeDeep(raw);

      // Lấy ngôn ngữ từ header, mặc định 'en'
      const langHeader =
        req.headers["accept-language"]?.toString().split(",")[0] ||
        req.headers["language"]?.toString() ||
        "en";

      (req as any).lang = langHeader;

      const result = schema.safeParse(clean);
      if (!result.success) {
        let errorDetail: any;

        switch (errorStyle) {
          case "message":
            errorDetail = t(langHeader, result.error.message, namespace);
            break;

          case "flatten": {
            const flat = result.error.flatten();
            errorDetail = {
              fieldErrors: Object.fromEntries(
                Object.entries(flat.fieldErrors).map(([field, msgs]) => [
                  field,
                  // Ép kiểu msgs về string[] hoặc [] nếu undefined
                  (msgs as string[] | undefined)?.map((msg) =>
                    t(langHeader, msg, namespace)
                  ) || [],
                ])
              ),
              formErrors: (flat.formErrors as string[]).map((msg) =>
                t(langHeader, msg, namespace)
              ),
            };
            break;
          }

          default: // "issues"
            errorDetail = result.error.issues.map((i) => ({
              field: i.path.join("."),
              message: t(langHeader, i.message, namespace),
              code: i.code,
            }));
        }

        return res
          .status(400)
          .json(
            ProcessError(
              t(langHeader, "invalid_data"),
              400,
              "ValidationError",
              t(langHeader, "error_detail"),
              errorDetail
            )
          );
      }

      req[source] = result.data;
      next();
    } catch (err: any) {
      return res.status(500).json(ExceptionError(err.message));
    }
  };
}
