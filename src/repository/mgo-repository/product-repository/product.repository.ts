// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import {
  IProduct,
  ProductModel,
} from "../../../model/entities/product.entities";

export class ProductRepository extends BaseRepository<IProduct> {
  constructor(model: Model<IProduct> = ProductModel) {
    super(model);
  }
}
