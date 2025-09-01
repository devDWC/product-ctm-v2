import { ICategoryGroup } from "../../entities/category-group.entities";

export class CategoryGroupDto {
  categoryGroupId: string;
  name: string;
  slug: string;
  description: string;
  userUpdate: number;
  userCreate: number;
  createDate?: Date;
  updateDate?: Date;
  isDeleted: Boolean;
  constructor(data: Partial<ICategoryGroup>) {
    this.categoryGroupId = data.categoryGroupId ?? "";
    this.name = data.name ?? "";
    this.slug = data.slug ?? "";
    this.description = data.description ?? "";
    this.userUpdate = data.userUpdate ?? 0;
    this.userCreate = data.userCreate ?? 0;
    this.createDate = data.createDate;
    this.updateDate = data.updateDate;
    this.isDeleted = data.isDeleted ?? false;
  }
}

export interface CreateCategoryGroupDto {
  name: string;
  slug: string;
  userCreate: number;
  description?: string;
  isDeleted?: boolean;
}

export interface InputCategoryGroupDto {
  /**
   * Tên nhóm danh mục
   * @example "Thời trang nam"
   */
  name: string;

  /**
   * Đường dẫn slug
   * @example "thoi-trang-nam"
   */
  slug: string;

  /**
   * ID người tạo
   * @example 1
   */
  userCreate: number;

  /**
   * Mô tả chi tiết
   * @example "Nhóm danh mục cho các sản phẩm thời trang nam"
   */
  description?: string;

  /**
   * Trạng thái xóa
   * @example false
   */
  isDeleted?: boolean;
}

export class OutputCategoryGroupDto {
  categoryGroupId: string;
  name: string;
  slug: string;
  description?: string;
  userCreate: number;
  userUpdate: number;
  createDate?: Date;
  updateDate?: Date;
  isDeleted: boolean;

  constructor(data: any) {
    this.categoryGroupId = data.categoryGroupId ?? "";
    this.name = data.name ?? "";
    this.slug = data.slug ?? "";
    this.description = data.description ?? "";
    this.userCreate = data.userCreate ?? 0;
    this.userUpdate = data.userUpdate ?? 0;
    this.createDate = data.createDate;
    this.updateDate = data.updateDate;
    this.isDeleted = data.isDeleted ?? false;
  }
}
export interface UpdateCategoryGroupDto {
  name?: string;
  slug?: string;
  description?: string;
  userUpdate: number;
  isDeleted?: boolean;
}
