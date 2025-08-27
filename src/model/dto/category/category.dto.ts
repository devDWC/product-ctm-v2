//src/model/dto/category/category.dto.ts
import { ICategory } from "../../entities/category.entities";

export type CustomId = {
  mongoId?: string;
  categoryId: string;
};
export class CategoryDto {
  image_url: string;
  name: string;
  slug: string;
  description: string;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  meta_slug: string;
  userUpdate?: number;
  createDate?: Date;
  updateDate?: Date;
  isDeleted: boolean;
  parentId: string;
  index: number;
  order: number;
  createUser: number;
  customId: CustomId;

  constructor(data: Partial<ICategory>) {
    this.customId = {
      mongoId: (data?._id || "").toString(),
      categoryId: data.categoryId?.toString() || "",
    };
    this.image_url = data.image_url ?? "";
    this.name = data.name ?? "";
    this.slug = data.slug ?? "";
    this.description = data.description ?? "";
    this.meta_title = data.meta_title ?? "";
    this.meta_keywords = data.meta_keywords ?? "";
    this.meta_description = data.meta_description ?? "";
    this.meta_slug = data.meta_slug ?? "";
    this.userUpdate = data.userUpdate;
    this.createDate = data.createDate;
    this.updateDate = data.updateDate;
    this.isDeleted = data.isDeleted ?? false;
    this.parentId = data.parentId ?? "0";
    this.index = data.index ?? 0;
    this.order = data.order ?? 0;
    this.createUser = data.createUser ?? 0;
  }
}

export type CategoryInfo = {
  categoryId: string;
  name: string;
  slug: string;
};

export interface CreateCategoryDto {
  name: string;
  slug?: string;
  description?: string;
  image_url?: string;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  meta_slug?: string;
  parentId?: number;
  index?: number;
  order?: number;
  createUser?: number;
  folderPath?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  image_url?: string;
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  meta_slug?: string;
  parentId?: number;
  index?: number;
  order?: number;
  createUser?: number;
  folderPath?: string;
}

export interface ICategoryNode {
  categoryId: string;
  name: string;
  parentId: string;
  image_url: string;
  slug: string;
  level: number;
  index: number;
  children: ICategoryNode[];
}
