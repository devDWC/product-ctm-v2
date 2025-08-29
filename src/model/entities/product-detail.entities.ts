// models/ProductDetails.ts
import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho ProductDetails
export interface IProductDetails extends Document {
  productDetailId: string;
  name_product_details: string;
  title_product_details: string;
  slug_product_details: string;
  price_product_details: number;
  price_sale_product_details: number;
  sale_product_details: number;
  tenantId: number;
  entry_date_product_details: Date;
  exit_date_product_details: Date;
  expiration_date_product_details: Date;
  rating_product_details: number;
  isShow: number;
  unit: string;
  product_extend: string;
  amount_available: number;
  userUpdate: string;
  isDeleted: boolean;
  productId: string;
  categoryId: string;
  productCode: string;
  productType: string;
  short_description: string;
  referenceKey: string;
  createDate?: Date;
  updateDate?: Date;
  category?: mongoose.Types.ObjectId;
}

// Schema
const ProductDetailsSchema: Schema<IProductDetails> = new Schema(
  {
    productDetailId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    name_product_details: { type: String, default: "" },
    title_product_details: { type: String, default: "" },
    slug_product_details: { type: String, default: "", required: true },
    price_product_details: { type: Number, default: 0 },
    price_sale_product_details: { type: Number, default: 0 },
    sale_product_details: { type: Number, default: 0 },
    tenantId: { type: Number, default: 0 },
    entry_date_product_details: { type: Date, default: Date.now },
    exit_date_product_details: { type: Date, default: Date.now },
    expiration_date_product_details: { type: Date, default: Date.now },
    rating_product_details: { type: Number, default: 0 },
    isShow: { type: Number, default: 0 },
    unit: { type: String, default: "" },
    product_extend: { type: String, default: "", maxlength: 1000 },
    amount_available: { type: Number, default: 0 },
    userUpdate: { type: String, default: "" },
    isDeleted: { type: Boolean, default: false },
    productId: { type: String, required: true },
    categoryId: { type: String, required: true },
    productCode: { type: String, required: true, unique: true },
    productType: { type: String, required: true },
    short_description: { type: String, required: true },
    referenceKey: { type: String, default: "" },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // phải trùng với model Category đã export
    },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

export const ProductDetailsModel = mongoose.model<IProductDetails>(
  "ProductDetails",
  ProductDetailsSchema
);
