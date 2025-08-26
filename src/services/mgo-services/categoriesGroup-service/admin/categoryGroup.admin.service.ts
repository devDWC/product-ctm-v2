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
  //   public async updateCategory(
  //     categoryId: string,
  //     updateData: Partial<ICategory>
  //   ): Promise<CategoryDto | null> {
  //     const category = await this.categoryRepo.getOne({
  //       categoryId,
  //       isDeleted: false,
  //     });
  //     if (!category) {
  //       throw NotfoundError("Không tìm thấy category");
  //     }

  //     // 2. Nếu có name + slug mới thì check trùng
  //     if (updateData.name && updateData.slug) {
  //       const exists = await this.categoryRepo.getOne({
  //         name: updateData.name,
  //         slug: updateData.slug,
  //         isDeleted: false,
  //         categoryId: { $ne: categoryId }, // loại trừ chính nó
  //       });

  //       if (exists) {
  //         throw ConflictError("Category với name + slug đã tồn tại");
  //       }
  //     }

  //     if (updateData.parentId && updateData.parentId !== "0") {
  //       const categoryId = String(updateData.parentId);
  //       const parent = await this.categoryRepo.getOne({
  //         categoryId,
  //         isDeleted: false,
  //       });
  //       if (parent) {
  //         updateData.order = (parent.order || 0) + 1;
  //       }
  //     }
  //     const updated = await this.categoryRepo.update({ categoryId }, updateData);
  //     return updated ? new CategoryDto(updated) : null;
  //   }

  //   /**
  //    * Xóa category (soft delete) theo categoryId
  //    */
  //   public async deleteSoftCategory(
  //     categoryId: string
  //   ): Promise<CategoryDto | null> {
  //     const deleted = await this.categoryRepo.update(
  //       { categoryId },
  //       { isDeleted: true }
  //     );
  //     return deleted ? new CategoryDto(deleted) : null;
  //   }

  //   /**
  //    * Xóa category (soft delete) theo categoryId
  //    */
  //   public async deleteHardCategory(
  //     categoryId: string
  //   ): Promise<CategoryDto | null> {
  //     const deleted = await this.categoryRepo.delete({ categoryId });
  //     return deleted ? new CategoryDto(deleted) : null;
  //   }

  //   /**
  //    * Cập nhật order hoặc index
  //    */
  //   public async updateCategoryOrderOrIndex(
  //     categoryId: string,
  //     order?: number,
  //     index?: number
  //   ): Promise<CategoryDto | null> {
  //     const updateData: Partial<ICategory> = {};
  //     if (order !== undefined) updateData.order = order;
  //     if (index !== undefined) updateData.index = index;

  //     const updated = await this.categoryRepo.update({ categoryId }, updateData);

  //     return updated ? new CategoryDto(updated) : null;
  //   }
}
