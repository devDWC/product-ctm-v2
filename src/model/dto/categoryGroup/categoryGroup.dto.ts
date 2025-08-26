import { ICategoryGroup } from "../../../model/entities/categoryGroup.entities";

export class CategoryGroupDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  userUpdate: number;
  userCreate: number;
  createDate?: Date;
  updateDate?: Date;

  constructor(data: Partial<ICategoryGroup>) {
    this.id = data.id ?? "";
    this.name = data.name ?? "";
    this.slug = data.slug ?? "";
    this.description = data.description ?? "";
    this.userUpdate = data.userUpdate ?? 0;
    this.userCreate = data.userCreate ?? 0;
    this.createDate = data.createDate;
    this.updateDate = data.updateDate;
  }
}

export interface CreateCategoryGroupDto {
  name: string;
  slug: string;
  description?: string;
  userCreate: number;
}

export interface UpdateCategoryGroupDto {
  name?: string;
  slug?: string;
  description?: string;
  userUpdate: number;
}
