// src/validators/categories.validator.ts
import { z } from "zod";

export const createCategorySchema = z.object({
  // Required fields
  name: z.string().min(1, "error.name.required"),
  slug: z.string().min(1, "error.slug.required"),

  // Optional fields
  description: z.string().optional(),
  image_url: z.string().optional(),
  meta_title: z.string().optional(),
  meta_keywords: z.string().optional(), // sẽ parse sang array JSON nếu cần
  meta_description: z.string().optional(),
  meta_slug: z.string().optional(),
  parentId: z.number().optional(),
  index: z.number().optional(),
  order: z.number().optional(),
  createUser: z.number().optional(),
  userUpdate: z.number().optional(),
  isDeleted: z.boolean().optional(),
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
  parentId: z.number().optional(),
  index: z.number().optional(),
  order: z.number().optional(),
  userUpdate: z.number().optional(),
  isDeleted: z.boolean().optional(),
});
