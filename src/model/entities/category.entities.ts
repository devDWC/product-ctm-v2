import mongoose, { Schema, Document, Types } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho Category
export interface ICategory extends Document {
  categoryId: string;
  image_url: string;
  name: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  meta_slug: string;
  userUpdate?: number;
  createDate?: Date;
  updateDate?: Date;
  isDeleted: boolean;
  parentId: number;
  index: number;
  order: number;
  createUser: number;
}

// Schema
const CategorySchema: Schema<ICategory> = new Schema(
  {
    categoryId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    image_url: { type: String, default: "" },
    name: { type: String, default: "" },
    slug: { type: String, default: "" },
    description: { type: String, default: "" },
    meta_title: { type: String, default: "" },
    meta_keywords: { type: String, default: "" },
    meta_description: { type: String, default: "" },
    meta_slug: { type: String, default: "" },
    userUpdate: { type: Number, default: 0 },
    createDate: { type: Date, default: Date.now },
    updateDate: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    parentId: { type: Number, default: 0 },
    index: { type: Number, default: 0 },
    order: { type: Number, default: 0 },
    createUser: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

export const CategoryContext = mongoose.model<ICategory>(
  "Category",
  CategorySchema
);
