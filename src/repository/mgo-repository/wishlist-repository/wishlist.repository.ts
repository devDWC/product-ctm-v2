// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import { IWishlist, WishlistModel } from "../../../model/entities/wishlist.entities";

export class WishlistRepository extends BaseRepository<IWishlist> {
  constructor(model: Model<IWishlist> = WishlistModel) {
    super(model);
  }
}
