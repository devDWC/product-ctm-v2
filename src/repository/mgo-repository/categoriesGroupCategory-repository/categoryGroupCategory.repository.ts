// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import CategoryGroupCategory, {
  ICategoryGroupCategory,
} from "../../../model/entities/categoryGroupCategory.entities";

export class CategoryGroupCategoryRepository extends BaseRepository<ICategoryGroupCategory> {
  constructor(model: Model<ICategoryGroupCategory> = CategoryGroupCategory) {
    super(model);
  }
}
