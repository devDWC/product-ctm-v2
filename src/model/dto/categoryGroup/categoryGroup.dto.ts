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
  isDeleted: Boolean;
  constructor(data: Partial<ICategoryGroup>) {
    this.id = data.id ?? "";
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

export interface inputCategoryGroupDto {
  name: string;
  slug: string;
  userCreate: number;
  description?: string;
  isDeleted?: boolean;
}

export class outputCategoryGroupDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  userCreate: number;
  userUpdate: number;
  createDate?: Date;
  updateDate?: Date;
  isDeleted: boolean;

  constructor(data: any) {
    this.id = data.id ?? "";
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
