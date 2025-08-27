// src/validators/category-groups.validator.ts
import { z } from "zod";

const numberFromString = z.union([z.string(), z.number()]).transform((val) => {
  const num = Number(val);
  if (Number.isNaN(num)) throw new Error("invalid_number");
  return num;
});

const dateFromString = z
  .union([z.string(), z.date()])
  .optional()
  .transform((val) => {
    if (!val) return undefined;
    const date = new Date(val);
    if (isNaN(date.getTime())) throw new Error("invalid_date");
    return date;
  });
export const createCategoryGroupSchema = z.object({
  name: z.string().min(1, "error.name.required"),
  slug: z.string().min(1, "error.slug.required"),
  description: z.string().optional(),
  userCreate: numberFromString,
  userUpdate: numberFromString.optional(),
  createDate: dateFromString,
  updateDate: dateFromString,
});
export const updateCategoryGroupSchema = z.object({
  name: z.string().min(1, "error.name.required"),
  slug: z.string().min(1, "error.slug.required"),
  description: z.string().optional(),
  userCreate: numberFromString,
  userUpdate: numberFromString.optional(),
  createDate: dateFromString,
  updateDate: dateFromString,
});
