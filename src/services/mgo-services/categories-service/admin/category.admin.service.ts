// src/services/category.service.ts
import { CategoryDto } from "../../../../model/dto/category/category.dto";
import { CategoryRepository } from "../../../../repository/mgo-repository/categories-repository/categories.repository";
import {
  CategoryModel,
  ICategory,
} from "../../../../model/entities/category.entities";
import {
  ConflictError,
  NotfoundError,
} from "../../../../shared/utils/response.utility";
import {
  buildMongoQuery,
  buildPagination,
} from "../../../../shared/utils/mgo.utility";
import { InputQuery } from "../../../../model/base/input-query.dto";

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  /**
   * Lấy danh sách tất cả category (không xóa)
   */
  public async getAllCategories(option: InputQuery): Promise<{
    data: CategoryDto[];
    total: number;
  }> {
    const mongoBuild = {
      search: option.search,
      searchKeys: ["name", "slug"],
      sortList: option.sortList,
      conditions: option.conditions,
      baseFilter: { isDeleted: false },
      keyDenied: [],
    };

    const { filter, sort } = buildMongoQuery(mongoBuild);

    const { skip, limit } = buildPagination(
      option.pageCurrent,
      option.pageSize,
      100
    );

    const { data, total } = await this.categoryRepo.getMany(filter, null, {
      sort,
      skip,
      limit,
    });

    const mapped = data.map((c: ICategory) => new CategoryDto(c));
    return { data: mapped, total };
  }

  /**
   * Lấy category theo categoryId
   */
  public async getCategoryById(
    categoryId: string
  ): Promise<CategoryDto | null> {
    const category = await this.categoryRepo.getOne({
      categoryId,
      isDeleted: false,
    });
    return category ? new CategoryDto(category) : null;
  }

  /**
   * Lấy danh sách category con theo parentId
   */
  public async getCategoriesByParentId(
    categoriesParentId: string
  ): Promise<CategoryDto[]> {
    let listChildrenCategory: ICategory[] = [];

    async function getSubCategories(parentId: string) {
      const childCategories = await CategoryModel.find({
        parentId,
        isDeleted: false,
      }).lean();

      if (childCategories.length > 0) {
        listChildrenCategory = listChildrenCategory.concat(childCategories);

        for (const child of childCategories) {
          // Dùng categoryId của child làm parentId cho đệ quy
          await getSubCategories(child.categoryId);
        }
      }
    }

    await getSubCategories(categoriesParentId);
    const mapped = listChildrenCategory.map((c) => new CategoryDto(c));
    return mapped;
  }

  /**
   * Lấy category con (parentId != 0) với search, sortList và pagination
   */
  public async getCategoryWithoutParentId(option: InputQuery): Promise<{
    data: CategoryDto[];
    total: number;
  }> {
    // Xây dựng filter và sort dựa trên buildMongoQuery
    const mongoBuild = {
      search: option.search,
      searchKeys: ["name", "slug"],
      sortList: option.sortList,
      conditions: option.conditions,
      baseFilter: { parentId: { $ne: "0" }, isDeleted: false },
      keyDenied: [],
    };
    const { filter, sort } = buildMongoQuery(mongoBuild);

    const { skip, limit } = buildPagination(
      option.pageCurrent,
      option.pageSize,
      100
    );

    // Dùng getMany
    const { data, total } = await this.categoryRepo.getMany(filter, null, {
      sort,
      skip,
      limit,
    });

    const mapped = data.map((c: ICategory) => new CategoryDto(c));
    return { data: mapped, total };
  }

  /**
   * Lấy toàn bộ category dưới dạng tree
   * @param levelFilter (optional) Lọc theo level
   */
  public async getListCategoryLevel(levelFilter?: number) {
    // 1️⃣ Lấy tất cả category chưa xóa
    const { data: categories } = await this.categoryRepo.getMany({
      isDeleted: false,
    });

    // 2️⃣ Build tree đệ quy
    const buildTree = (parentId: string, level = 0): any[] => {
      const children = categories.filter((cat) => cat.parentId === parentId);

      return children.map((cat) => {
        const node = {
          id: cat.id,
          name: cat.name,
          parentId: cat.parentId,
          slug: cat.slug,
          image_url: cat.image_url,
          level,
          children: buildTree(cat.id, level + 1),
        };
        return node;
      });
    };

    const tree = buildTree("0");

    // 3️⃣ Nếu levelFilter có giá trị, lọc các node tương ứng
    if (typeof levelFilter === "number") {
      const result: any[] = [];

      const traverse = (nodes: any[]) => {
        for (const node of nodes) {
          if (node.level === levelFilter) {
            result.push({
              id: node.id,
              name: node.name,
              parentId: node.parentId,
              slug: node.slug,
              image_url: node.image_url,
              level: node.level,
            });
          }
          if (node.children.length > 0) traverse(node.children);
        }
      };

      traverse(tree);
      return result;
    }

    return tree;
  }

  /**
   * Tạo mới category với check slug + name trùng
   */
  public async createCategory(data: Partial<ICategory>): Promise<CategoryDto> {
    // Nếu có parent thì set order = parent.order + 1
    let order = 1;
    if (data.parentId && data.parentId !== "0") {
      const categoryId = String(data.parentId);
      const parent = await this.categoryRepo.getOne({
        categoryId,
        isDeleted: false,
      });
      if (parent) {
        order = (parent.order || 0) + 1;
      }
    }

    data.order = order;

    const category = await this.categoryRepo.create(data, {
      slug: data.slug,
      name: data.name,
      isDeleted: false,
    } as any);

    if (!category) {
      throw ConflictError("Category này đã tồn tại (slug + name).");
    }

    return new CategoryDto(category);
  }

  /**
   * Cập nhật category theo categoryId
   */
  public async updateCategory(
    categoryId: string,
    updateData: Partial<ICategory>
  ): Promise<CategoryDto | null> {
    const category = await this.categoryRepo.getOne({
      categoryId,
      isDeleted: false,
    });
    if (!category) {
      throw NotfoundError("Không tìm thấy category");
    }

    // 2. Nếu có name + slug mới thì check trùng
    if (updateData.name && updateData.slug) {
      const exists = await this.categoryRepo.getOne({
        name: updateData.name,
        slug: updateData.slug,
        isDeleted: false,
        categoryId: { $ne: categoryId }, // loại trừ chính nó
      });

      if (exists) {
        throw ConflictError("Category với name + slug đã tồn tại");
      }
    }

    if (updateData.parentId && updateData.parentId !== "0") {
      const categoryId = String(updateData.parentId);
      const parent = await this.categoryRepo.getOne({
        categoryId,
        isDeleted: false,
      });
      if (parent) {
        updateData.order = (parent.order || 0) + 1;
      }
    }
    const updated = await this.categoryRepo.update({ categoryId }, updateData);
    return updated ? new CategoryDto(updated) : null;
  }

  /**
   * Xóa category (soft delete) theo categoryId
   */
  public async deleteSoftCategory(
    categoryId: string
  ): Promise<CategoryDto | null> {
    const deleted = await this.categoryRepo.update(
      { categoryId },
      { isDeleted: true }
    );
    return deleted ? new CategoryDto(deleted) : null;
  }

  /**
   * Xóa category (soft delete) theo categoryId
   */
  public async deleteHardCategory(
    categoryId: string
  ): Promise<CategoryDto | null> {
    const deleted = await this.categoryRepo.delete({ categoryId });
    return deleted ? new CategoryDto(deleted) : null;
  }

  /**
   * Cập nhật order hoặc index
   */
  public async updateCategoryOrderOrIndex(
    categoryId: string,
    order?: number,
    index?: number
  ): Promise<CategoryDto | null> {
    const updateData: Partial<ICategory> = {};
    if (order !== undefined) updateData.order = order;
    if (index !== undefined) updateData.index = index;

    const updated = await this.categoryRepo.update({ categoryId }, updateData);

    return updated ? new CategoryDto(updated) : null;
  }
}
