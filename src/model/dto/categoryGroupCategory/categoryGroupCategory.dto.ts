import { CategoryDto } from "../category/category.dto";

export class CategoryGroupCategoryDto {
  categoryGroupCategoryId?: string; // optional vì khi input thì có thể chưa có id
  categoryGroupId: string;
  categoryId: string;
  userUpdate?: number;
  userCreate?: number;
  createDate?: Date;
  updateDate?: Date;
  categories?: CategoryDto[];

  constructor(data: Partial<CategoryGroupCategoryDto>) {
    this.categoryGroupCategoryId = data.categoryGroupCategoryId;
    this.categoryGroupId = data.categoryGroupId ?? "";
    this.categoryId = data.categoryId ?? "";
    this.userUpdate = data.userUpdate ?? 0;
    this.userCreate = data.userCreate ?? 0;
    this.createDate = data.createDate;
    this.updateDate = data.updateDate;
    this.categories = data.categories;
  }
}

export class InputCategoryGroupCategoryDto {
  /**
   * id danh mục
   * @example "8c1f4bb4-2b7a-4b2b-8d2d-123456789abc"
   */
  categoryGroupId: string;
  /**
   * id khuyến mãi
   * @example [
   *     "090cff41-21ec-4a86-a789-44862ab1bc2a",
   *     "456e4567-e89b-12d3-a456-426614174111",
   *     "789e4567-e89b-12d3-a456-426614174222",
   *   ]
   */
  categories: string[]; // mảng DTO con
  /**
   * user tạo
   * @example 1
   */
  userCreate?: number;

  constructor(data: Partial<InputCategoryGroupCategoryDto>) {
    this.categoryGroupId = data.categoryGroupId ?? "";
    (this.categories = data.categories || []),
      (this.userCreate = data.userCreate ?? 0);
  }
}

export class InputCategoryDto {
  categoryId: string;

  constructor(data: Partial<InputCategoryDto>) {
    this.categoryId = data.categoryId ?? "";
  }
}

export class OutputCategoryGroupCategoryDto {
  categoryGroupId: string;
  name: string;
  slug: string;
  description: string;
  userUpdate: number;
  userCreate: number;
  createDate?: Date;
  updateDate?: Date;
  categories?: CategoryDto[];
  constructor(data: Partial<OutputCategoryGroupCategoryDto>) {
    this.categoryGroupId = data.categoryGroupId ?? "";
    this.name = data.name ?? "";
    this.slug = data.slug ?? "";
    this.description = data.description ?? "";
    this.userUpdate = data.userUpdate ?? 0;
    this.userCreate = data.userCreate ?? 0;
    this.createDate = data.createDate;
    this.updateDate = data.updateDate;
    this.categories = data.categories;
  }
}
