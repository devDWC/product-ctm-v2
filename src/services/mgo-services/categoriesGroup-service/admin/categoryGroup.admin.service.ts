// src/services/category.service.ts
import { CategoryGroupDto } from "../../../../model/dto/categoryGroup/categoryGroup.dto";
import CategoryGroup, {
  ICategoryGroup,
} from "../../../../model/entities/categoryGroup.entities";
import { CategoryGroupRepository } from "../../../../repository/mgo-repository/categoriesGroup-repository/categoryGroup.repository";
import { InputQuery } from "../../../../model/base/input-query.dto";
import { buildMongoQuery } from "../../../../shared/utils/mgo.utility";
import {
  ConflictError,
  NotfoundError,
} from "../../../../shared/utils/response.utility";

export class CategoryGrService {
  private categoryGrRepo: CategoryGroupRepository;

  constructor() {
    this.categoryGrRepo = new CategoryGroupRepository();
  }

  /**
   * Tạo mới category với check slug + name trùng
   */
  public async createCategory(
    data: Partial<ICategoryGroup>
  ): Promise<CategoryGroupDto> {
    // Nếu có parent thì set order = parent.order + 1
    let order = 1;

    const category = await this.categoryGrRepo.create(data, {
      slug: data.slug,
      name: data.name,
      isDeleted: false,
    } as any);

    if (!category) {
      throw ConflictError("Category này đã tồn tại (slug + name).");
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

    const skip = ((option.pageCurrent || 1) - 1) * (option.pageSize || 10);
    const limit = option.pageSize || 10;

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
