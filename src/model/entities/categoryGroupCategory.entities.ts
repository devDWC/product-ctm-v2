import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho CategoryGroupCategory
export interface ICategoryGroupCategory extends Document {
  categoryGroupCategoryId: string;
  categoryGroupId: string;
  categoryId: string;
  userUpdate: number;
  userCreate: number;
  createDate: Date;
  updateDate: Date;
}

// Schema
const CategoryGroupCategorySchema = new Schema<ICategoryGroupCategory>(
  {
    categoryGroupCategoryId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    categoryGroupId: {
      type: String,
      default: "",
    },
    categoryId: {
      type: String,
      default: "",
    },
    userUpdate: {
      type: Number,
      default: 0,
    },
    userCreate: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

// Model
const CategoryGroupCategoryModel = model<ICategoryGroupCategory>(
  "CategoryGroupCategory",
  CategoryGroupCategorySchema
);

export default CategoryGroupCategoryModel;
