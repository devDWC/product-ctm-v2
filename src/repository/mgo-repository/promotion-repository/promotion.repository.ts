// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import {
  IPromotion,
  PromotionModel,
} from "../../../model/entities/promotion.entities";

export class PromotionRepository extends BaseRepository<IPromotion> {
  constructor(model: Model<IPromotion> = PromotionModel) {
    super(model);
  }
}
