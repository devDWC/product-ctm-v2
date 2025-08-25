import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho Product
export interface IProduct extends Document {
  productId: string;
  productCode: string;
  name: string;
  title: string;
  slug: string;
  meta_slug: string;
  productType: string;
  description: string;
  short_description: string;
  image_url: string;
  gallery_product: string; // có thể chuyển thành string[] nếu cần
  price: number;
  product_extend: string;
  unit: string;
  availability: boolean;
  rating: number;
  review_count: number;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  affiliateLinks: string;
  status: string;
  categoryId: string;
  referenceKey: string;
  userUpdate?: string;
  userCreate?: string;
  isDeleted: boolean;
  createDate?: Date;
  updateDate?: Date;
}

// Schema
const ProductSchema: Schema<IProduct> = new Schema(
  {
    productId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    productCode: { type: String, default: "", unique: true, required: true },
    name: { type: String, default: "" },
    title: { type: String, default: "" },
    slug: { type: String, default: "", index: true },
    meta_slug: { type: String, default: "", index: true },
    productType: { type: String, default: "product-source" },
    description: { type: String, default: "" },
    short_description: { type: String, default: "" },
    image_url: { type: String, default: "" },
    gallery_product: { type: String, default: "" },
    price: { type: Number, default: 0 },
    product_extend: { type: String, default: "" },
    unit: { type: String, default: "" },
    availability: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    meta_title: { type: String, default: "" },
    meta_keywords: { type: String, default: "" },
    meta_description: { type: String, default: "" },
    affiliateLinks: { type: String, default: "" },
    status: { type: String, default: "" },
    categoryId: { type: String, default: "" },
    referenceKey: {
      type: String,
      default: uuidv4,
      required: true,
    },
    userUpdate: { type: String, default: "" },
    userCreate: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

export const ProductModel = mongoose.model<IProduct>("Product", ProductSchema);
