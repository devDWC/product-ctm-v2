import mongoose, { Schema, Document } from "mongoose";
import { v4 as uuidv4 } from "uuid";

// Interface cho Wishlist
export interface IWishlist extends Document {
  wishlistId: string; // thay vì "id" trùng keyword, mình đổi thành wishlistId
  userId: string | null;
  productId: string | null;
  createDate?: Date;
  updateDate?: Date;
}

// Schema
const WishlistSchema: Schema<IWishlist> = new Schema(
  {
    wishlistId: {
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
    productId: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: { createdAt: "createDate", updatedAt: "updateDate" },
  }
);

export const WishlistModel = mongoose.model<IWishlist>(
  "Wishlist",
  WishlistSchema
);
