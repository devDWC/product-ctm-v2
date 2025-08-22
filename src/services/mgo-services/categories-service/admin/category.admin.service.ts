// src/services/category.service.ts

import { CategoryDto } from "../../../../model/dto/category/category.dto";
import { CategoryRepository } from "../../../../repository/mgo-repository/categories-repository/categories.repository";
import { ICategory } from "../../../../model/entities/category.entities";
import { ConflictError } from "../../../../shared/utils/response.utility";

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  /**
   * Tạo mới category với check slug + name trùng
   */
  public async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    // Nếu có parent thì set order = parent.order + 1
    let order = 1;
    if (data.parentId && data.parentId !== 0) {
      const parent = await this.categoryRepo.getByCategoryId(
        String(data.parentId)
      );
      if (parent) {
        order = (parent.order || 0) + 1;
      }
    }

    data.order = order;

    const category = await this.categoryRepo.createCategory(data);

    if (!category) {
      throw new Error("Category này đã tồn tại (slug + name).");
    }

    return category;
  }

  /**
   * Lấy category theo categoryId
   */
  public async getCategoryById(categoryId: string): Promise<ICategory | null> {
    return this.categoryRepo.getByCategoryId(categoryId);
  }

  /**
   * Cập nhật category theo categoryId
   */
  public async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<CategoryDto | null> {
    const updated = await this.categoryRepo.updateByCategoryId(
      categoryId,
      updateData
    );
    return updated ? new CategoryDto(updated) : null;
  }

  /**
   * Xóa category (soft delete) theo categoryId
   */
  public async deleteCategory(categoryId: string): Promise<CategoryDto | null> {
    const deleted = await this.categoryRepo.deleteByCategoryId(categoryId);
    return deleted ? new CategoryDto(deleted) : null;
  }

  /**
   * Cập nhật order hoặc index
   */
  public async updateCategoryOrderOrIndex(
    categoryId: string,
    order?: number,
    index?: number
  ): Promise<CategoryDto | null> {
    const updated = await this.categoryRepo.updateOrderOrIndex(
      categoryId,
      order,
      index
    );
    return updated ? new CategoryDto(updated) : null;
  }
}
