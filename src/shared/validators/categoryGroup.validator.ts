// src/validators/category-groups.validator.ts
import { z } from "zod";

export const createCategoryGroupSchema = z.object({
  name: z.string().min(1, "error.name.required"),
  slug: z.string().min(1, "error.slug.required"),
  description: z.string().optional(),

  userCreate: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), {
      message: "error.userCreate.invalid_number",
    }),

  userUpdate: z
    .string()
    .transform((val) => Number(val))
    .refine((val) => !Number.isNaN(val), {
      message: "error.userUpdate.invalid_number",
    }),

  createDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (val) => val === undefined || !isNaN(val.getTime()),
      "error.createDate.invalid_date"
    ),

  updateDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (val) => val === undefined || !isNaN(val.getTime()),
      "error.updateDate.invalid_date"
    ),
});

export const updateCategoryGroupSchema = z.object({
  name: z.string().min(1, "error.name.required").optional(),
  slug: z.string().min(1, "error.slug.required").optional(),
  description: z.string().optional(),

  userCreate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userCreate.invalid_number",
    }),

  userUpdate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userUpdate.invalid_number",
    }),

  createDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (val) => val === undefined || !isNaN(val.getTime()),
      "error.createDate.invalid_date"
    ),

  updateDate: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (val) => val === undefined || !isNaN(val.getTime()),
      "error.updateDate.invalid_date"
    ),
});
