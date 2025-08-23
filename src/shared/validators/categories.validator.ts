// src/validators/categories.validator.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  // Required fields
  name: z.string().min(1, "error.name.required"),
  slug: z.string().min(1, "error.slug.required"),

  // Optional fields (parse từ string sang number/boolean nếu cần)
  description: z.string().optional(),
  image_url: z.string().optional(),
  meta_title: z.string().optional(),
  meta_keywords: z.string().optional(), // parse JSON array nếu cần
  meta_description: z.string().optional(),
  meta_slug: z.string().optional(),
  parentId: z.string().optional(),
  index: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.index.invalid_number",
    }),

  order: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.order.invalid_number",
    }),

  createUser: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.createUser.invalid_number",
    }),

  userUpdate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userUpdate.invalid_number",
    }),
  folderPath: z.string().optional(),
  isDeleted: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val.toLowerCase() === "true"
    ),
});

export const updateCategorySchema = z.object({
  // Optional for update
  name: z.string().min(1, "error.name.required").optional(),
  slug: z.string().min(1, "error.slug.required").optional(),
  description: z.string().optional(),
  image_url: z.string().optional(),
  meta_title: z.string().optional(),
  meta_keywords: z.string().optional(),
  meta_description: z.string().optional(),
  meta_slug: z.string().optional(),
  parentId: z.string().optional(),
  index: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.index.invalid_number",
    }),

  order: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.order.invalid_number",
    }),

  createUser: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.createUser.invalid_number",
    }),

  userUpdate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userUpdate.invalid_number",
    }),
  folderPath: z.string().optional(),
  isDeleted: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val.toLowerCase() === "true"
    ),
});
