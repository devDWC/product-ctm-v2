// src/services/category.service.ts
import {
  CategoryGroupDto,
  CreateCategoryGroupDto,
  InputCategoryGroupDto,
  UpdateCategoryGroupDto,
} from "../../../../model/dto/categoryGroup/categoryGroup.dto";

import { InputQuery } from "../../../../model/base/input-query.dto";
import {
  buildMongoQuery,
  buildPagination,
} from "../../../../shared/utils/mgo.utility";
import {
  ConflictError,
  NotfoundError,
} from "../../../../shared/utils/response.utility";
import { CategoryGroupRepository } from "../../../../repository/mgo-repository/categories-group-repository/category-group.repository";
import { ICategoryGroup } from "../../../../model/entities/category-group.entities";
import { t } from "../../../../locales";

export class CategoryGrService {
  private categoryGrRepo: CategoryGroupRepository;

  constructor() {
    this.categoryGrRepo = new CategoryGroupRepository();
  }

  /**
   * Tạo mới category với check slug + name trùng
   */
  public async createCategory(
    data: InputCategoryGroupDto,
    lang: string = "en"
  ): Promise<CategoryGroupDto> {
    const category = await this.categoryGrRepo.create(data, {
      slug: data.slug,
      name: data.name,
      isDeleted: false,
    } as any);

    if (!category) {
      throw ConflictError(t(lang, "existing", "categoryGroup"));
    }

    return new CategoryGroupDto(category);
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

    const { skip, limit } = buildPagination(
      option.pageCurrent,
      option.pageSize,
      100
    );

    const { data, total } = await this.categoryGrRepo.getMany(filter, null, {
      sort,
      skip,
      limit,
    });

    const mapped = data.map((c: ICategoryGroup) => new CategoryGroupDto(c));
    return { data: mapped, total };
  }

  /**
   * Cập nhật category theo categoryId
//    */
  public async updateCategory(
    categoryGroupId: string,
    updateData: InputCategoryGroupDto,
    lang: string = "en"
  ) {
    const category = await this.categoryGrRepo.getOne({
      categoryGroupId,
      isDeleted: false,
    });
    if (!category) {
      return NotfoundError(t(lang, "notFound", "categoryGroup"));
    }

    // 2. Nếu có name + slug mới thì check trùng
    if (updateData.name && updateData.slug) {
      const exists = await this.categoryGrRepo.getOne({
        name: updateData.name,
        slug: updateData.slug,
        isDeleted: false,
        categoryGroupId: { $ne: categoryGroupId }, // loại trừ chính nó
      });

      if (exists) {
        return ConflictError(t(lang, "existing", "categoryGroup"));
      }
    }

    const updated = await this.categoryGrRepo.update(
      { categoryGroupId },
      updateData
    );
    return updated ? new CategoryGroupDto(updated) : null;
  }

  //   /**
  //    * Xóa category (soft delete) theo categoryId
  //    */
  public async deleteSoftCategory(
    categoryGroupId: string
  ): Promise<CategoryGroupDto | null> {
    const deleted = await this.categoryGrRepo.update(
      { categoryGroupId },
      { isDeleted: true }
    );
    return deleted ? new CategoryGroupDto(deleted) : null;
  }

  //   /**
  //    * Xóa category (soft delete) theo categoryId
  //    */
  public async deleteHardCategory(
    categoryGroupId: string
  ): Promise<CategoryGroupDto | null> {
    const deleted = await this.categoryGrRepo.delete({ categoryGroupId });
    return deleted ? new CategoryGroupDto(deleted) : null;
  }

  public async getCategoryById(
    categoryGroupId: string
  ): Promise<CategoryGroupDto | null> {
    const category = await this.categoryGrRepo.getOne({
      categoryGroupId,
      isDeleted: false,
    });
    return category ? new CategoryGroupDto(category) : null;
  }
}
