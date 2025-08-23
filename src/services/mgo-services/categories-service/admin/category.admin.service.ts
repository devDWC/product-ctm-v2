// src/services/category.service.ts
import { CategoryDto } from "../../../../model/dto/category/category.dto";
import { CategoryRepository } from "../../../../repository/mgo-repository/categories-repository/categories.repository";
import { ICategory } from "../../../../model/entities/category.entities";
import {
  ConflictError,
  NotfoundError,
} from "../../../../shared/utils/response.utility";

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  /**
   * Tạo mới category với check slug + name trùng
   */
  public async createCategory(data: Partial<ICategory>): Promise<CategoryDto> {
    // Nếu có parent thì set order = parent.order + 1
    let order = 1;
    if (data.parentId && data.parentId !== "0") {
      const categoryId = String(data.parentId);
      const parent = await this.categoryRepo.getOne({
        categoryId,
        isDeleted: false,
      });
      if (parent) {
        order = (parent.order || 0) + 1;
      }
    }

    data.order = order;

    const category = await this.categoryRepo.create(data, {
      slug: data.slug,
      name: data.name,
      isDeleted: false,
    } as any);

    if (!category) {
      throw ConflictError("Category này đã tồn tại (slug + name).");
    }

    return new CategoryDto(category);
  }

  /**
   * Cập nhật category theo categoryId
   */
  public async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<CategoryDto | null> {
    const category = await this.categoryRepo.getOne({
      categoryId,
      isDeleted: false,
    });
    if (!category) {
      throw NotfoundError("Không tìm thấy category");
    }

    // 2. Nếu có name + slug mới thì check trùng
    if (updateData.name && updateData.slug) {
      const exists = await this.categoryRepo.getOne({
        name: updateData.name,
        slug: updateData.slug,
        isDeleted: false,
        categoryId: { $ne: categoryId }, // loại trừ chính nó
      });

      if (exists) {
        throw ConflictError("Category với name + slug đã tồn tại");
      }
    }

    if (updateData.parentId && updateData.parentId !== "0") {
      const categoryId = String(updateData.parentId);
      const parent = await this.categoryRepo.getOne({
        categoryId,
        isDeleted: false,
      });
      if (parent) {
        updateData.order = (parent.order || 0) + 1;
      }
    }
    const updated = await this.categoryRepo.update({ categoryId }, updateData);
    return updated ? new CategoryDto(updated) : null;
  }

  /**
   * Xóa category (soft delete) theo categoryId
   */
  public async deleteSoftCategory(
    categoryId: string
  ): Promise<CategoryDto | null> {
    const deleted = await this.categoryRepo.update(
      { categoryId },
      { isDeleted: true }
    );
    return deleted ? new CategoryDto(deleted) : null;
  }

  /**
   * Xóa category (soft delete) theo categoryId
   */
  public async deleteHardCategory(
    categoryId: string
  ): Promise<CategoryDto | null> {
    const deleted = await this.categoryRepo.delete({ categoryId });
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
    const updateData: Partial<ICategory> = {};
    if (order !== undefined) updateData.order = order;
    if (index !== undefined) updateData.index = index;

    const updated = await this.categoryRepo.update({ categoryId }, updateData);

    return updated ? new CategoryDto(updated) : null;
  }
}
