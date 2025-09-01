// src/services/category-group-category.service.ts
import {
  CategoryGroupCategoryDto,
  InputCategoryGroupCategoryDto,
  OutputCategoryGroupCategoryDto,
} from "../../../../model/dto/categoryGroupCategory/categoryGroupCategory.dto";
import { InputQuery } from "../../../../model/base/input-query.dto";
import {
  buildMongoQuery,
  buildPagination,
} from "../../../../shared/utils/mgo.utility";

import { CategoryGroupCategoryRepository } from "../../../../repository/mgo-repository/categories-group-category-repository/category-group-category.repository";
import { CategoryGroupRepository } from "../../../../repository/mgo-repository/categories-group-repository/category-group.repository";
import CategoryGroupCategoryModel from "../../../../model/entities/categoryGroupCategory.entities";
import { CategoryRepository } from "../../../../repository/mgo-repository/categories-repository/categories.repository";
import { CategoryDto } from "../../../../model/dto/category/category.dto";
export class CategoryGrCategoryService {
  private categoryGrCateRepo: CategoryGroupCategoryRepository;
  private categoryGrRepo: CategoryGroupRepository;
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryGrCateRepo = new CategoryGroupCategoryRepository();
    this.categoryGrRepo = new CategoryGroupRepository();
    this.categoryRepo = new CategoryRepository();
  }

  /**
   * Tạo mới category với check slug + name trùng
   */
  public async createCategoryGroupCategory(
    data: InputCategoryGroupCategoryDto
  ): Promise<CategoryGroupCategoryDto[]> {
    const docs = data.categories.map((cate) => ({
      categoryGroupId: data.categoryGroupId,
      categoryId: cate,
      userCreate: data.userCreate ?? 0,
      userUpdate: 0,
      createDate: new Date(),
      updateDate: new Date(),
    }));

    // Lấy ra các cặp (categoryGroupId + categoryId) đã tồn tại
    const { data: existing } = await this.categoryGrCateRepo.getMany({
      categoryGroupId: data.categoryGroupId,
      categoryId: { $in: data.categories.map((c) => c) },
    });

    const existingPairs = new Set(
      existing.map((e) => `${e.categoryGroupId}-${e.categoryId}`)
    );

    // Chỉ giữ lại những docs chưa tồn tại
    const filteredDocs = docs.filter(
      (d) => !existingPairs.has(`${d.categoryGroupId}-${d.categoryId}`)
    );

    if (filteredDocs.length === 0) {
      return []; // không có gì mới để insert
    }

    const created = await CategoryGroupCategoryModel.insertMany(filteredDocs);

    return created.map((doc) => new CategoryGroupCategoryDto(doc));
  }

  /**
   * Lấy danh sách category group kèm categories
   */
  public async getAllCategories(option: InputQuery): Promise<{
    data: OutputCategoryGroupCategoryDto[];
    total: number;
  }> {
    const mongoBuild = {
      search: option.search,
      searchKeys: ["name", "slug"],
      sortList: option.sortList,
      conditions: option.conditions,
      baseFilter: { isDeleted: false },
    };

    const { filter, sort } = buildMongoQuery(mongoBuild);

    const { skip, limit } = buildPagination(
      option.pageCurrent,
      option.pageSize,
      100
    );

    // Lấy danh sách category group
    const { data: groups, total } = await this.categoryGrRepo.getMany(
      filter,
      null,
      {
        sort,
        skip,
        limit,
      }
    );

    if (!groups.length) {
      return { data: [], total };
    }

    // Lấy tất cả groupId
    const groupIds = groups.map((g: any) => g.categoryGroupId.toString());

    // Lấy toàn bộ mapping CategoryGroupCategory theo groupId
    const { data: groupCategories } = await this.categoryGrCateRepo.getMany(
      { categoryGroupId: { $in: groupIds } },
      null,
      {}
    );

    // Lấy toàn bộ categoryId
    const categoryIds = groupCategories.map((gc) => gc.categoryId);

    // Lấy chi tiết categories
    const { data: categories } = await this.categoryRepo.getMany(
      { categoryId: { $in: categoryIds }, isDeleted: false },
      null,
      {}
    );

    // Index categories theo id để tìm nhanh
    const categoryMap = categories.reduce((acc, cate) => {
      acc[cate.categoryId.toString()] = cate;
      return acc;
    }, {} as Record<string, any>);

    // Group categories theo groupId
    const groupedCategories = groupIds.reduce((acc, groupId) => {
      const cateIds = groupCategories
        .filter((gc) => gc.categoryGroupId.toString() === groupId)
        .map((gc) => gc.categoryId);

      acc[groupId] = cateIds
        .map((cid) => categoryMap[cid])
        .filter(Boolean)
        .map((c) => new CategoryDto(c));

      return acc;
    }, {} as Record<string, CategoryDto[]>);

    // Map thành DTO có categories
    const mapped = groups.map(
      (cg: any) =>
        new OutputCategoryGroupCategoryDto({
          ...cg,
          categories: groupedCategories[cg.categoryGroupId.toString()] || [],
        })
    );

    return { data: mapped, total };
  }

  /**
   * xóa một danh mục ra khỏi danh mục nhóm
   */
  public async deleteOne(categoryGroupId: string, categoryId: string) {
    return await this.categoryGrCateRepo.delete({
      categoryGroupId,
      categoryId,
    });
  }

  /**
   * xóa một nhiều danh mục con ra khỏi danh mục nhóm
   */
  public async deleteMany(data: InputCategoryGroupCategoryDto) {
    try {
      // Xóa tất cả theo categoryGroupId và categoryIds
      const result = await this.categoryGrCateRepo.deleteMany({
        categoryGroupId: data.categoryGroupId,
        categoryId: { $in: data.categories },
      });

      return result;
    } catch (error: any) {
      console.error("error: ", error.message);
      throw new Error(error.message);
    }
  }
}
