import xss from "xss";
import { ZodSchema } from "zod";
import { t } from "../../locales";
import { ExceptionError, ProcessError } from "../utils/response.utility";

export function sanitizeDeep(obj: any): any {
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

interface ValidateOptions {
  errorStyle?: "issues" | "message" | "flatten";
  namespace?: string;
}

/**
 * Validate và sanitize dữ liệu
 * - Nếu lỗi nghiệp vụ → trả về ProcessError
 * - Nếu thành công → trả về data đã validate
 */
export function validateAndSanitize<T extends ZodSchema>(
  schema: T,
  data: any,
  lang: string = "en",
  options: ValidateOptions = {}
): { data?: any; error?: ReturnType<typeof ProcessError> } {
  try {
    const clean = sanitizeDeep(data);
    const result = schema.safeParse(clean);

    if (!result.success) {
      const { errorStyle = "issues", namespace } = options;
      let errorDetail: any;

      switch (errorStyle) {
        case "message":
          errorDetail = t(lang, result.error.message, namespace);
          break;
        case "flatten": {
          const flat = result.error.flatten();
          errorDetail = {
            fieldErrors: Object.fromEntries(
              Object.entries(flat.fieldErrors).map(([field, msgs]) => [
                field,
                (msgs as string[] | undefined)?.map((msg) =>
                  t(lang, msg, namespace)
                ) || [],
              ])
            ),
            formErrors: (flat.formErrors as string[]).map((msg) =>
              t(lang, msg, namespace)
            ),
          };
          break;
        }
        default:
          errorDetail = result.error.issues.map((i) => ({
            field: i.path.join("."),
            message: t(lang, i.message, namespace),
            code: i.code,
          }));
      }

      return {
        error: ProcessError(
          t(lang, "invalid_data"),
          400,
          "ValidationError",
          t(lang, "error_detail"),
          errorDetail
        ),
      };
    }

    return { data: result.data };
  } catch (err: any) {
    // Chỉ wrap lỗi hệ thống
    return {
      error: ExceptionError(err.message),
    };
  }
}
