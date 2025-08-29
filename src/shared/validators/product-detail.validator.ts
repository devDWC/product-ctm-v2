// src/validations/productDetail.schema.ts
import { z } from "zod";

export const createProductDetailSchema = z.object({
  // Required fields
  name_product_details: z
    .string()
    .min(1, "error.name_product_details.required"),
  title_product_details: z
    .string()
    .min(1, "error.title_product_details.required"),
  productId: z.string().min(1, "error.productId.required"),
  categoryId: z.string().min(1, "error.categoryId.required"),
  productType: z.string().min(1, "error.productType.required"),
  short_description: z.string().min(1, "error.short_description.required"),

  // Optional fields
  productDetailId: z.string().optional(),
  productCode: z.string().optional(),
  sale_product_details: z.number().optional(),
  price_product_details: z.number().optional(),
  price_sale_product_details: z.number().optional(),
  tenantId: z.number().optional(),

  entry_date_product_details: z
    .union([z.date(), z.string().transform((val) => new Date(val))])
    .optional(),
  exit_date_product_details: z
    .union([z.date(), z.string().transform((val) => new Date(val))])
    .optional(),
  expiration_date_product_details: z
    .union([z.date(), z.string().transform((val) => new Date(val))])
    .optional(),

  rating_product_details: z.number().optional(),
  isShow: z.number().optional(),

  unit: z.string().optional(),
  product_extend: z.string().optional(),
  amount_available: z.number().optional(),

  userUpdate: z.string().optional(),
  referenceKey: z.string().optional(),

  spotlight_title_ids: z.array(z.string()).optional(),

  isDeleted: z.boolean().optional().default(false),
});
