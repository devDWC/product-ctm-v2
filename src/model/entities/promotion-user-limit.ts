import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho PromotionUserLimit
export interface IPromotionUserLimit extends Document {
  promotionUserLimitId: string;
  promotionId: string;
  phone: string;
  amount: number;
  lastPurchaseAt?: Date;
  isDeleted?: boolean;
  createDate?: Date;
  updateDate?: Date;
}

// Schema
const PromotionUserLimitSchema: Schema<IPromotionUserLimit> = new Schema(
  {
    promotionUserLimitId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    promotionId: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
      required: true,
    },
    lastPurchaseAt: {
      type: Date,
      default: Date.now,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

export const PromotionUserLimitModel = mongoose.model<IPromotionUserLimit>(
  "PromotionUserLimit",
  PromotionUserLimitSchema
);
