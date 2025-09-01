// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import CategoryGroupModel, {
  ICategoryGroup,
} from "../../../model/entities/category-group.entities";

export class CategoryGroupRepository extends BaseRepository<ICategoryGroup> {
  constructor(model: Model<ICategoryGroup> = CategoryGroupModel) {
    super(model);
  }
}
