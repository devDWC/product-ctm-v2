import { z } from "zod";

export const createPromotionSchema = z.object({
  // Required
  name: z.string().min(1, "error.name.required"),
  codeName: z.string().min(1, "error.codeName.required"),

  // Optional string fields
  description: z.string().optional(),
  type: z.string().optional(),
  color_code: z.string().optional(),
  background_color_code: z.string().optional(),
  background_color_promotion_code: z.string().optional(),
  is_recurring: z.string().optional(),
  recurring_config: z.string().optional(),
  userUpdate: z.string().optional(),
  value1: z.string().optional(),
  value2: z.string().optional(),
  value3: z.string().optional(),

  // Numeric fields (parse string → number)
  tenantId: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.tenantId.invalid_number",
    }),
  index: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.index.invalid_number",
    }),
  number1: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.number1.invalid_number",
    }),
  number2: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.number2.invalid_number",
    }),
  number3: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.number3.invalid_number",
    }),
  limit_items: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.limit_items.invalid_number",
    }),

  // Boolean fields (parse string → boolean)
  status: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      const lower = val.toLowerCase();
      if (lower === "true") return true;
      if (lower === "false") return false;
      return val;
    })
    .refine((val) => val === undefined || typeof val === "boolean", {
      message: "error.status.invalid_boolean",
    }),
  bool1: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      const lower = val.toLowerCase();
      if (lower === "true") return true;
      if (lower === "false") return false;
      return val;
    })
    .refine((val) => val === undefined || typeof val === "boolean", {
      message: "error.bool1.invalid_boolean",
    }),
  bool2: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      const lower = val.toLowerCase();
      if (lower === "true") return true;
      if (lower === "false") return false;
      return val;
    })
    .refine((val) => val === undefined || typeof val === "boolean", {
      message: "error.bool2.invalid_boolean",
    }),
  bool3: z
    .string()
    .optional()
    .transform((val) => {
      if (val === undefined) return undefined;
      const lower = val.toLowerCase();
      if (lower === "true") return true;
      if (lower === "false") return false;
      return val;
    })
    .refine((val) => val === undefined || typeof val === "boolean", {
      message: "error.bool3.invalid_boolean",
    }),

  // Date fields (parse string → Date)
  start_time: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? new Date(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val.getTime()), {
      message: "error.start_time.invalid_date",
    }),
  end_time: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? new Date(val) : undefined))
    .refine((val) => val === undefined || !isNaN(val.getTime()), {
      message: "error.end_time.invalid_date",
    }),
});
