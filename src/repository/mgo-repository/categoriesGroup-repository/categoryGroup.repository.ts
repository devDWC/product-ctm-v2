// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import CategoryGroup, {
  ICategoryGroup,
} from "../../../model/entities/categoryGroup.entities";

export class CategoryGroupRepository extends BaseRepository<ICategoryGroup> {
  constructor(model: Model<ICategoryGroup> = CategoryGroup) {
    super(model);
  }
}
