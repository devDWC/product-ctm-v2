// models/ProductPromotion.ts
import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho ProductPromotion
export interface IProductPromotion extends Document {
  productPromotionId: string;
  product_details_id: string;
  promotion_id: string;
  product_details_extendId: string;
  priceSale_promotion: number;
  sale_promotion: number;
  quantity_promotion: number;
  sold: number;
  createDate?: Date;
  updateDate?: Date;
}

// Schema
const ProductPromotionSchema: Schema<IProductPromotion> = new Schema(
  {
    productPromotionId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    product_details_id: {
      type: String,
      default: "",
    },
    promotion_id: {
      type: String,
      ref: "Promotion",
      required: true,
    },
    product_details_extendId: {
      type: String,
      default: "",
    },
    priceSale_promotion: {
      type: Number,
      default: 0,
    },
    sale_promotion: {
      type: Number,
      default: 0,
    },
    quantity_promotion: {
      type: Number,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

export const ProductPromotionModel = mongoose.model<IProductPromotion>(
  "ProductPromotion",
  ProductPromotionSchema
);
