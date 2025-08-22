// src/repositories/category.repository.ts
import { Model } from "mongoose";
import { BaseRepository } from "../base.repository";
import {
  CategoryContext,
  ICategory,
} from "../../../model/entities/category.entities";

export class CategoryRepository extends BaseRepository<ICategory> {
  constructor(model: Model<ICategory> = CategoryContext) {
    super(model);
  }

  /**
   * Lấy category theo categoryId
   */
  public async getByCategoryId(categoryId: string): Promise<ICategory | null> {
    return this.model.findOne({ categoryId, isDeleted: false }).exec();
  }

  /**
   * Tạo mới category, nếu slug + name đã tồn tại thì trả về null
   */
  public async createCategory(
    data: Partial<ICategory>
  ): Promise<ICategory | null> {
    const exists = await this.model
      .findOne({
        slug: data.slug,
        name: data.name,
        isDeleted: false,
      })
      .exec();

    if (exists) {
      return null;
    }

    const doc = new this.model(data);
    return doc.save();
  }

  /**
   * Cập nhật category dựa vào categoryId
   */
  public async updateByCategoryId(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<ICategory | null> {
    return this.model
      .findOneAndUpdate({ categoryId }, updateData, { new: true })
      .exec();
  }

  /**
   * Xóa category (soft delete) dựa vào categoryId
   */
  public async deleteByCategoryId(
    categoryId: string
  ): Promise<ICategory | null> {
    return this.model
      .findOneAndUpdate({ categoryId }, { isDeleted: true }, { new: true })
      .exec();
  }

  /**
   * Lấy danh sách category theo parentId
   */
  public async getByParentId(parentId: number): Promise<ICategory[]> {
    return this.model.find({ parentId, isDeleted: false }).exec();
  }

  /**
   * Tăng order hoặc cập nhật index
   */
  public async updateOrderOrIndex(
    categoryId: string,
    order?: number,
    index?: number
  ): Promise<ICategory | null> {
    const updateData: Partial<ICategory> = {};
    if (order !== undefined) updateData.order = order;
    if (index !== undefined) updateData.index = index;

    return this.model
      .findOneAndUpdate({ categoryId }, updateData, { new: true })
      .exec();
  }
}
