// models/Promotion.ts
import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho Promotion
export interface IPromotion extends Document {
  promotionId: string;
  name: string;
  description: string;
  type: string;
  banner_img: string;
  logo_img: string;
  color_code: string;
  start_time: Date | null;
  end_time: Date | null;
  tenantId: number;
  is_recurring: string;
  recurring_config: string;
  status: boolean;
  userUpdate: string;
  codeName: string;
  index: number;
  value1: string | null;
  value2: string | null;
  value3: string | null;
  number1: number;
  number2: number;
  number3: number;
  bool1: boolean;
  bool2: boolean;
  bool3: boolean;
  isDeleted: boolean;
  limit_items: number | null;
  createDate?: Date;
  updateDate?: Date;
}

// Schema
const PromotionSchema: Schema<IPromotion> = new Schema(
  {
    promotionId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    name: { type: String, default: "" },
    description: { type: String, default: "" },
    type: { type: String, default: "" },
    banner_img: { type: String, default: "" },
    logo_img: { type: String, default: "" },
    color_code: { type: String, default: "" },
    start_time: { type: Date, default: null },
    end_time: { type: Date, default: null },
    tenantId: { type: Number, default: 0 },
    is_recurring: { type: String, default: "" },
    recurring_config: { type: String, default: "" },
    status: { type: Boolean, default: true },
    userUpdate: { type: String, default: "" },
    codeName: { type: String, default: "" },
    index: { type: Number, default: 1 },
    value1: { type: String, default: null },
    value2: { type: String, default: null },
    value3: { type: String, default: null },
    number1: { type: Number, default: 0 },
    number2: { type: Number, default: 0 },
    number3: { type: Number, default: 0 },
    bool1: { type: Boolean, default: false },
    bool2: { type: Boolean, default: false },
    bool3: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    limit_items: { type: Number, default: null },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

export const PromotionModel = mongoose.model<IPromotion>(
  "Promotion",
  PromotionSchema
);
