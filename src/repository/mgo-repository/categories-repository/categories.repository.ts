// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import {
  CategoryModel,
  ICategory,
} from "../../../model/entities/category.entities";

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor(model: Model<ICategory> = CategoryModel) {
    super(model);
  }

}
