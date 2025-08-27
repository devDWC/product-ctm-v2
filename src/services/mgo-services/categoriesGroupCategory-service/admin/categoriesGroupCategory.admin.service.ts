// src/services/category.service.ts
import {
  CategoryGroupCategoryDto,
  InputCategoryGroupCategoryDto,
} from "../../../../model/dto/categoryGroupCategory/categoryGroupCategory.dto";
import CategoryGroupCategory, {
  ICategoryGroupCategory,
} from "../../../../model/entities/categoryGroupCategory.entities";
import { CategoryGroupCategoryRepository } from "../../../../repository/mgo-repository/categoriesGroupCategory-repository/categoryGroupCategory.repository";
import { InputQuery } from "../../../../model/base/input-query.dto";
import { buildMongoQuery } from "../../../../shared/utils/mgo.utility";
import {
  ConflictError,
  NotfoundError,
} from "../../../../shared/utils/response.utility";
import CategoryGroup, {
  ICategoryGroup,
} from "../../../../model/entities/categoryGroup.entities";
import { CategoryGroupRepository } from "../../../../repository/mgo-repository/categoriesGroup-repository/categoryGroup.repository";

import { CategoryGroupDto } from "../../../../model/dto/categoryGroup/categoryGroup.dto";
export class CategoryGrCategoryService {
  private categoryGrCateRepo: CategoryGroupCategoryRepository;
  private categoryGrRepo: CategoryGroupRepository;
  constructor() {
    this.categoryGrCateRepo = new CategoryGroupCategoryRepository();
    this.categoryGrRepo = new CategoryGroupRepository();
  }

  /**
   * Tạo mới category với check slug + name trùng
   */
  public async createCategoryGroupCategory(
    data: InputCategoryGroupCategoryDto
  ): Promise<CategoryGroupCategoryDto[]> {
    const docs = data.categories.map((cate) => ({
      categoryGroupId: data.categoryGroupId,
      categoryId: cate.categoryId,
      userCreate: data.userCreate ?? 0,
      userUpdate: 0,
      createDate: new Date(),
      updateDate: new Date(),
    }));

    // Lấy ra các cặp (categoryGroupId + categoryId) đã tồn tại
    const existing = await CategoryGroupCategory.find({
      categoryGroupId: data.categoryGroupId,
      categoryId: { $in: data.categories.map((c) => c.categoryId) },
    }).lean();

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

    const created = await CategoryGroupCategory.insertMany(filteredDocs);

    return created.map((doc) => new CategoryGroupCategoryDto(doc));
  }

  public async getAllCategories(option: InputQuery): Promise<{
    data: CategoryGroupDto[];
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

    const skip = ((option.pageCurrent || 1) - 1) * (option.pageSize || 10);
    const limit = option.pageSize || 10;

    const { data, total } = await this.categoryGrRepo.getMany(filter, null, {
      sort,
      skip,
      limit,
    });

    // --- lấy tất cả groupId để query categories ---
    const groupIds = data.map((g: ICategoryGroup) => g.id.toString());
    console.log("groupIds", groupIds);
    // gọi repo để lấy categories
    const { data: categories } = await this.categoryGrCateRepo.getMany(
      { categoryGroupId: { $in: groupIds } },
      null,
      {}
    );
    console.log("data", { categories });
    // group theo groupId
    const groupedCategories = groupIds.reduce((acc, groupId) => {
      acc[groupId] = categories
        .filter((c) => c.categoryGroupId.toString() === groupId)
        .map((c) => new CategoryGroupCategoryDto(c));
      return acc;
    }, {} as Record<string, CategoryGroupCategoryDto[]>);

    console.log("groupedCategories", groupedCategories);
    // --- map DTO có categories ---
    const mapped = data.map(
      (cg: ICategoryGroup) =>
        new CategoryGroupDto({
          ...cg.toObject(),
          categories: groupedCategories[cg.id.toString()] || [],
        })
    );

    return { data: mapped, total };
  }
  /**
   * Cập nhật category theo categoryId
//    */
  public async updateCategory(
    id: string,
    updateData: Partial<ICategoryGroup>
  ): Promise<CategoryGroupDto | null> {
    const category = await this.categoryGrRepo.getOne({
      id,
      isDeleted: false,
    });
    if (!category) {
      throw NotfoundError("Không tìm thấy category");
    }

    // 2. Nếu có name + slug mới thì check trùng
    if (updateData.name && updateData.slug) {
      const exists = await this.categoryGrRepo.getOne({
        name: updateData.name,
        slug: updateData.slug,
        isDeleted: false,
        id: { $ne: id }, // loại trừ chính nó
      });

      if (exists) {
        throw ConflictError("CategoryGroup với name + slug đã tồn tại");
      }
    }

    const updated = await this.categoryGrRepo.update({ id }, updateData);
    return updated ? new CategoryGroupDto(updated) : null;
  }

  //   /**
  //    * Xóa category (soft delete) theo categoryId
  //    */
  public async deleteSoftCategory(
    id: string
  ): Promise<CategoryGroupDto | null> {
    const deleted = await this.categoryGrRepo.update(
      { id },
      { isDeleted: true }
    );
    return deleted ? new CategoryGroupDto(deleted) : null;
  }

  //   /**
  //    * Xóa category (soft delete) theo categoryId
  //    */
  public async deleteHardCategory(
    id: string
  ): Promise<CategoryGroupDto | null> {
    const deleted = await this.categoryGrRepo.delete({ id });
    return deleted ? new CategoryGroupDto(deleted) : null;
  }

  public async getCategoryById(id: string): Promise<CategoryGroupDto | null> {
    const category = await this.categoryGrRepo.getOne({
      id,
      isDeleted: false,
    });
    return category ? new CategoryGroupDto(category) : null;
  }
}
