// src/validators/categories.validator.ts
import { z } from "zod";

export const createWishlistSchema = z.object({
  // Required fields
  userId: z.string().min(1, "error.userId.required"),
  productId: z.string().min(1, "error.productId.required"),
});
