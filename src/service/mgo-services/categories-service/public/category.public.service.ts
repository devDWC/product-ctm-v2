// src/services/category.service.ts

import { CategoryDto } from "../../../../model/dto/category/category.dto";
import { CategoryRepository } from "../../../../repository/mgo-repository/categories-repository/categories.repository";
import { ICategory } from "../../../../model/entities/category.entities";

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  /**
   * Lấy danh sách tất cả category (không xóa)
   */
  public async getAllCategories(): Promise<{
    data: CategoryDto[];
    total: number;
  }> {
    const { data, total } = await this.categoryRepo.getMany({
      isDeleted: false,
    });
    const mapped = data.map((c: ICategory) => new CategoryDto(c));
    return { data: mapped, total };
  }

  /**
   * Lấy category theo categoryId
   */
  public async getCategoryById(
    categoryId: string
  ): Promise<CategoryDto | null> {
    const category = await this.categoryRepo.getByCategoryId(categoryId);
    return category ? new CategoryDto(category) : null;
  }

  /**
   * Lấy danh sách category con theo parentId
   */
  public async getCategoriesByParentId(
    parentId: number
  ): Promise<CategoryDto[]> {
    const categories = await this.categoryRepo.getByParentId(parentId);
    return categories.map((c: ICategory) => new CategoryDto(c));
  }
}
