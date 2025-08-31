// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import { ICart, CartModel } from "../../../model/entities/cart.entities";

export class CartRepository extends BaseRepository<ICart> {
  constructor(model: Model<ICart> = CartModel) {
    super(model);
  }
}
