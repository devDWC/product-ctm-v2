// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import {
  IProductDetails,
  ProductDetailsModel,
} from "../../../model/entities/product-detail.entities";

export class ProductDetailRepository extends BaseRepository<IProductDetails> {
  constructor(model: Model<IProductDetails> = ProductDetailsModel) {
    super(model);
  }
}
