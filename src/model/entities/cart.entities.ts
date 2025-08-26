// models/Cart.ts
import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho Cart
export interface ICart extends Document {
  cartId: string;
  userId: string | null;
  tenantId: number | null;
  quantity: number;
  product_details_id: string;
  product_details_extend_id: string;
  productCode: string | null;
  referenceKey: string | null;
  userUpdate: number;
  userCreate: number;
  createDate?: Date;
  updateDate?: Date;
}

// Schema
const CartSchema: Schema<ICart> = new Schema(
  {
    cartId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    userId: {
      type: String,
      unique: false,
      sparse: true,
      default: null,
    },
    tenantId: {
      type: Number,
      default: null,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    product_details_id: {
      type: String,
      default: "",
    },
    product_details_extend_id: {
      type: String,
      default: "",
    },
    productCode: {
      type: String,
      default: null,
    },
    referenceKey: {
      type: String,
      default: null,
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

export const CartModel = mongoose.model<ICart>("Cart", CartSchema);
