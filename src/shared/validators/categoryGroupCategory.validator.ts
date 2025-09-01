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

// Schema cho request body
export const createCategoryGroupCategorySchema = z.object({
  categoryGroupId: z.string().min(1, "error.categoryGroupId.required"),
  categories: z.array(z.string().min(1)).min(1, "error.categories.required"),
  userCreate: numberFromString,
  userUpdate: numberFromString.optional(),
  createDate: dateFromString,
  updateDate: dateFromString,
});

export const updateCategoryGroupCategorySchema =
  createCategoryGroupCategorySchema.extend({});
