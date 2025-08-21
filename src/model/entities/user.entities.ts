import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Định nghĩa interface cho User document
export interface IUser extends Document {
  id: string;
  emailAddress?: string | null;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  listAddress?: string | null;
  points?: number;
  status?: string;
  passwordHash?: string;
  listTenant?: string;
  userUpdate?: number;
  userCreate?: number;
  privateKey?: string;
  defaultAddress?: string;
  defaultTenant?: number;
  defaultOrganization?: number;
  defaultStore?: number;
  rule?: string;
  employed?: number;
  lat?: number;
  lng?: number;
  originSystem?: string;
  isDeleted?: boolean;
  avatar?: string;
  createDate?: Date;
  updateDate?: Date;
}

// Khai báo schema
const UserSchema: Schema<IUser> = new Schema(
  {
    id: {
      type: String,
      default: uuidv4,
      unique: true,
      required: true,
    },
    emailAddress: {
      type: String,
      default: null,
    },
    phoneNumber: {
      type: String,
      unique: true,
      default: null,
      required: true,
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    fullName: { type: String, default: "" },
    listAddress: { type: String, default: null },
    points: { type: Number, default: 0 },
    status: { type: String, default: "active" },
    passwordHash: { type: String, default: "" },
    listTenant: { type: String, default: "" },
    userUpdate: { type: Number, default: 0 },
    userCreate: { type: Number, default: 0 },
    privateKey: { type: String, default: "" },
    defaultAddress: { type: String, default: "" },
    defaultTenant: { type: Number, default: 0 },
    defaultOrganization: { type: Number, default: 0 },
    defaultStore: { type: Number, default: 0 },
    rule: { type: String, default: "PENDING" },
    employed: { type: Number },
    lat: { type: Number, default: 0.0 },
    lng: { type: Number, default: 0.0 },
    originSystem: { type: String, default: "chothongminh.com" },
    isDeleted: { type: Boolean, default: false },
    avatar: { type: String, default: "" },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

// Tùy chọn nếu bạn cần virtual "id" thay cho "_id"
// UserSchema.virtual('id').get(function () {
//   return this._id.toHexString();
// });

// UserSchema.set('toJSON', { virtuals: true });

export const UserContext = mongoose.model<IUser>("User", UserSchema);
