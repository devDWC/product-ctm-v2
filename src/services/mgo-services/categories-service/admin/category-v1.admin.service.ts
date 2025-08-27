// src/services/category.service.ts
import { CategoryRepository } from "../../../../repository/mgo-repository/categories-repository/categories.repository";
import {
  CategoryModel,
  ICategory,
} from "../../../../model/entities/category.entities";
import { ProductModel } from "../../../../model/entities/product.entities";
import { ProductDetailsModel } from "../../../../model/entities/product-detail.entities";
import { ICategoryNode } from "../../../../model/dto/category/category.dto";
import { NotfoundError } from "../../../../shared/utils/response.utility";
import { t } from "../../../../locales";

export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }

  public async getListProductsWithCategory(lang: string = "en") {
    try {
      // 1. Lấy tất cả category cha (parentId = "0")
      const { data: parentCategories, total } = await this.categoryRepo.getMany(
        { parentId: "0", isDeleted: false },
        { _id: 0 },
        {}
      );
      const listData: any[] = [];

      // 2. Chạy song song cho từng category cha
      await Promise.all(
        parentCategories.map(async (element: ICategory) => {
          // Lấy danh mục con
          const { data: children, total } = await this.categoryRepo.getMany(
            { parentId: element.categoryId, isDeleted: false },
            { _id: 0 },
            {}
          );

          // Lấy tất cả categoryId cần query product (cha + con)
          const categoryIds = [
            element.categoryId,
            ...children.map((c) => c.categoryId),
          ];

          // Lấy 12 sản phẩm thuộc nhóm này
          const products = await ProductModel.find({
            categoryId: { $in: categoryIds },
          })
            .limit(12)
            .lean();

          // Push dữ liệu đã gom
          listData.push({
            categories: element,
            listChildrenCategory: children,
            listProduct: products,
          });
        })
      );

      return { listData, dataCategory: [] };
    } catch (error: any) {
      console.error("Lỗi khi xử lý dữ liệu:", error);
      throw new Error(t(lang, "getFailure", "categories"));
    }
  }

  public async getListCategory(
    tenantId: string | null = null,
    lang: string = "en"
  ) {
    try {
      // Lấy tất cả category từ Mongo

      const { data: categories, total } = await this.categoryRepo.getMany(
        { isDeleted: false },
        { _id: 0 },
        {}
      );
      // Hàm đệ quy build tree
      const buildTree = (parentId: string, level = 0): ICategoryNode[] => {
        const children = categories.filter((c) => c.parentId === parentId);

        if (children.length === 0) return [];

        return children.map((c) => ({
          categoryId: c.categoryId,
          name: c.name,
          parentId: c.parentId,
          image_url: c.image_url,
          slug: c.slug,
          level,
          index: c.index,
          children: buildTree(c.categoryId, level + 1),
        }));
      };

      // Gốc có parentId = "0"
      const tree = buildTree("0");

      return await this.checkHasValidProduct(tree, tenantId);
    } catch (error) {
      console.error("❌ Lỗi khi xử lý dữ liệu:", error);
      throw new Error(t(lang, "getFailure", "categories"));
    }
  }

  /**
   * Check xem category có product hợp lệ không
   */
  private async checkHasValidProduct(
    categoryList: any[],
    tenantId: string | null = null
  ) {
    // Lấy toàn bộ categoryId con
    const allChildIds = categoryList.flatMap((parent) =>
      parent.children.map((child: any) => child.categoryId.toString())
    );

    // Filter cho ProductDetails
    const filter: any = { categoryId: { $in: allChildIds } };
    if (tenantId) filter.tenantId = tenantId.toString();

    // Lấy toàn bộ categoryId có ít nhất 1 product
    const productCategoryIds = await ProductDetailsModel.distinct(
      "categoryId",
      filter
    );

    const productCategorySet = new Set(
      productCategoryIds.map((id) => id.toString())
    );

    // Trả về danh sách cha có gắn hasProduct
    return categoryList.map((parent) => {
      const has = parent.children.some((child: any) =>
        productCategorySet.has(child.categoryId.toString())
      );
      return {
        ...parent,
        hasProduct: has,
      };
    });
  }

  // Hàm đệ quy build cây danh mục
  private async buildCategoryTree(parentId: string): Promise<any[]> {
    const { data: childCategories, total } = await this.categoryRepo.getMany(
      { parentId, isDeleted: false },
      {
        _id: 0,
        categoryId: 1,
        name: 1,
        slug: 1,
        parentId: 1,
        order: 1,
        index: 1,
        image_url: 1,
      },
      {}
    );
    return Promise.all(
      childCategories.map(async (category) => ({
        ...category,
        children: await this.buildCategoryTree(category.categoryId),
      }))
    );
  }

  // Hàm lấy category theo slug + build cây con
  public async getCategoryBySlug(slug: string, lang: string = "en") {
    try {
      const parentCategory = await this.categoryRepo.getOne(
        { slug, isDeleted: false },
        {
          _id: 0,
          categoryId: 1,
          name: 1,
          slug: 1,
          description: 1,
          meta_title: 1,
          meta_keywords: 1,
          meta_description: 1,
          userUpdate: 1,
          updateDate: 1,
          createDate: 1,
          isDeleted: 1,
          parentId: 1,
          order: 1,
          index: 1,
          image_url: 1,
        }
      );
      if (!parentCategory) {
        return NotfoundError(t(lang, "notFound", "categories"));
      }

      const tree = await this.buildCategoryTree(parentCategory.categoryId);

      return {
        ...parentCategory,
        children: tree,
      };
    } catch (error: any) {
      console.error("❌ Error fetching categories:", error);
      throw new Error(t(lang, "getFailure", "categories"));
    }
  }

  public async getCategoryTreeById(categoryId: string, lang: string = "en") {
    try {
      const parentCategory = await this.categoryRepo.getOne(
        { categoryId, isDeleted: false },
        {
          _id: 0,
          categoryId: 1,
          name: 1,
          slug: 1,
          description: 1,
          meta_title: 1,
          meta_keywords: 1,
          meta_description: 1,
          userUpdate: 1,
          updateDate: 1,
          createDate: 1,
          isDeleted: 1,
          parentId: 1,
          order: 1,
          index: 1,
          image_url: 1,
        }
      );

      if (!parentCategory) {
        return NotfoundError(t(lang, "notFound", "categories"));
      }
      const tree = await this.buildCategoryTree(parentCategory.categoryId);

      return {
        ...parentCategory,
        children: tree,
      };
    } catch (error: any) {
      console.error("❌ Error fetching categories:", error);
      throw new Error(t(lang, "getFailure", "categories"));
    }
  }
}
