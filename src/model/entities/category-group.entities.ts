import { Schema, model, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Định nghĩa interface cho CategoryGroup
export interface ICategoryGroup extends Document {
  categoryGroupId: string;
  name: string;
  slug: string;
  description: string;
  userUpdate: number;
  userCreate: number;
  createDate: Date;
  updateDate: Date;
  isDeleted: Boolean;
}

// Tạo schema
const categoryGroupSchema = new Schema<ICategoryGroup>(
  {
    categoryGroupId: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      default: "",
    },
    description: {
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
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

// Tạo model
const CategoryGroupModel = model<ICategoryGroup>(
  "CategoryGroup",
  categoryGroupSchema
);

export default CategoryGroupModel;
