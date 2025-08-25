import { z } from "zod";

export const createProductSchema = z.object({
  // Bắt buộc
  name: z.string().min(1, "error.name.required"),
  title: z.string().min(1, "error.title.required"),
  slug: z.string().min(1, "error.slug.required"),
  price: z
    .string()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.price.invalid_number",
    }),
  categoryId: z.string().min(1, "error.categoryId.required"),

  //Optional
  description: z.string().optional(),
  short_description: z.string().optional(),
  image_url: z.string().optional(),
  gallery_product: z.string().optional(),
  product_extend: z.string().optional(),
  unit: z.string().optional(),
  productType: z.string().optional(),
  meta_title: z.string().optional(),
  meta_keywords: z.string().optional(),
  meta_description: z.string().optional(),
  affiliateLinks: z.string().optional(),
  status: z.string().optional(),
  folderPath: z.string().optional(),

  // Numeric fields (parse string → number)

  rating: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.rating.invalid_number",
    }),

  review_count: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.review_count.invalid_number",
    }),

  // Boolean fields (parse string → boolean)
  availability: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val.toLowerCase() === "true"
    ),

  isDeleted: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val.toLowerCase() === "true"
    ),

  // User fields (string → number)
  userUpdate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userUpdate.invalid_number",
    }),

  userCreate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userCreate.invalid_number",
    }),
});

export const updateProductSchema = z.object({
  // Không còn required như create, tất cả optional
  name: z.string().optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  price: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.price.invalid_number",
    }),
  categoryId: z.string().optional(),

  description: z.string().optional(),
  short_description: z.string().optional(),
  image_url: z.string().optional(),
  gallery_product: z.string().optional(),
  product_extend: z.string().optional(),
  unit: z.string().optional(),
  productType: z.string().optional(),
  meta_title: z.string().optional(),
  meta_keywords: z.string().optional(),
  meta_description: z.string().optional(),
  affiliateLinks: z.string().optional(),
  status: z.string().optional(),
  folderPath: z.string().optional(),

  rating: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.rating.invalid_number",
    }),

  review_count: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.review_count.invalid_number",
    }),

  availability: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val.toLowerCase() === "true"
    ),

  isDeleted: z
    .string()
    .optional()
    .transform((val) =>
      val === undefined ? undefined : val.toLowerCase() === "true"
    ),

  userUpdate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userUpdate.invalid_number",
    }),

  userCreate: z
    .string()
    .optional()
    .transform((val) => (val !== undefined ? Number(val) : undefined))
    .refine((val) => val === undefined || !Number.isNaN(val), {
      message: "error.userCreate.invalid_number",
    }),
});