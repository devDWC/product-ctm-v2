import { ICategoryGroupCategory } from "../../entities/categoryGroupCategory.entities";

export class CategoryGroupCategoryDto {
  id?: string; // optional vì khi input thì có thể chưa có id
  categoryGroupId: string;
  categoryId: string;
  userUpdate?: number;
  userCreate?: number;
  createDate?: Date;
  updateDate?: Date;

  constructor(data: Partial<CategoryGroupCategoryDto>) {
    this.id = data.id;
    this.categoryGroupId = data.categoryGroupId ?? "";
    this.categoryId = data.categoryId ?? "";
    this.userUpdate = data.userUpdate ?? 0;
    this.userCreate = data.userCreate ?? 0;
    this.createDate = data.createDate;
    this.updateDate = data.updateDate;
  }
}

export class InputCategoryGroupCategoryDto {
  categoryGroupId: string;
  categories: InputCategoryDto[]; // mảng DTO con
  userCreate?: number;

  constructor(data: Partial<InputCategoryGroupCategoryDto>) {
    this.categoryGroupId = data.categoryGroupId ?? "";
    this.categories = (data.categories ?? []).map(
      (c) => new InputCategoryDto(c)
    );
    this.userCreate = data.userCreate ?? 0;
  }
}

export class InputCategoryDto {
  categoryId: string;

  constructor(data: Partial<InputCategoryDto>) {
    this.categoryId = data.categoryId ?? "";
  }
}
