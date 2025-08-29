//src/services/mgo-services/product-service/admin/product.admin.service.ts
import { InputQuery } from "./../../../../model/base/input-query.dto";
import { t } from "../../../../locales";

import { ProductExtension } from "../../../../shared/functions/product-extensions";
import { S3Service } from "../../../helper-services/s3.service";
import { v4 as uuidv4 } from "uuid";
import { CategoryService } from "../../categories-service/admin/category.admin.service";
import { createSlug, isNullOrEmpty } from "../../../helper-services/sp-service";
import {
  ProductDetailCreateDto,
  ProductDetailDto,
  ProductDtUpdateDto,
} from "../../../../model/dto/product-detail/product-detail.dto";
import unitOfWork from "../../../../shared/utils/unitOfWork";
import { ProductDetailsModel } from "../../../../model/entities/product-detail.entities";
import {
  buildMongoQuery,
  buildPagination,
} from "../../../../shared/utils/mgo.utility";
import { ProductDetailRepository } from "../../../../repository/mgo-repository/product-detail-repository/product-detail.repository";
import { ProductModel } from "../../../../model/entities/product.entities";
import { CategoryDto } from "../../../../model/dto/category/category.dto";
import { ProductPromotionModel } from "../../../../model/entities/product-promotion.entities";
import { PromotionModel } from "../../../../model/entities/promotion.entities";
import { autoMapWithClass } from "../../../../shared/utils/autoMap-untility";
import { CartModel } from "../../../../model/entities/cart.entities";
import {
  ConflictError,
  ExceptionError,
  NotfoundError,
  Success,
} from "../../../../shared/utils/response.utility";

export class ProductDetailService {
  private productDetailRepo: ProductDetailRepository;
  private readonly _s3Service = new S3Service();
  private readonly _productExtension = new ProductExtension();
  private readonly categoriesService = new CategoryService();

  constructor() {
    this.productDetailRepo = new ProductDetailRepository();
  }

  // Lấy danh sách sản phẩm productDetail có search và pagination
  public async getProductDetails(option: InputQuery) {
    const { skip, limit } = buildPagination(
      option.pageCurrent,
      option.pageSize,
      100
    );

    // Build query
    const buildMongo = {
      search: option.search,
      searchKeys: [
        "productCode",
        "name_product_details",
        "slug_product_details",
      ],
      sortList: option.sortList,
      baseFilter: { productType: "product-source" },
      conditions: option.conditions,
    };

    const { filter, sort } = buildMongoQuery(buildMongo);

    const { data: details, total } = await this.productDetailRepo.getMany(
      filter,
      { _id: 0, __v: 0 },
      {
        sort,
        skip,
        limit,
      }
    );

    const listWithProduct = await this.joinProduct(details);

    const finalDetails = await this.joinCategoriesToDetails(listWithProduct);
    const detailsReturn = await this._productExtension.mapProductListV1Async(
      finalDetails
    );
    const mapData = await this.mappingProductPromotion(detailsReturn);
    return {
      listData: mapData,
      total: total,
    };
  }

  // Lấy sản phẩm chi tiết theo productDetailId
  public async getProductDetailById(productDetailId: string) {
    const productDetail = await this.productDetailRepo.getOne(
      {
        productDetailId,
      },
      { _id: 0, __v: 0 }
    );

    if (productDetail) {
      const listWithProduct = await this.joinProduct([productDetail]);
      const finalDetails = await this.joinCategoriesToDetails(listWithProduct);
      const detailsReturn = await this._productExtension.mapProductListV1Async(
        finalDetails
      );
      return detailsReturn;
    } else {
      return null;
    }
  }

  // Hàm chính khởi tạo sản phẩm chi tiết
  public async createProductDetails(productListData: any[]) {
    // Tạo danh sách input model thuần (chưa gọi new ProductDetailsModel)
    const inputList = productListData.map((productData: any) => {
      const productCode = `B${productData.tenantId}-${productData.productCode}`;
      const slug = createSlug(
        `${productData.name_product_details}-${productData.title_product_details}`
      );

      const inputCreate = new ProductDetailCreateDto(productData);
      return {
        ...inputCreate,
        productDetailId: uuidv4(),
        productCode,
        slug_product_details: slug,
      };
    });

    const slugs = inputList.map((p) => p.slug_product_details);

    // Kiểm tra slug đã tồn tại trong DB chưa
    const { data: existed } = await this.productDetailRepo.getMany({
      slug_product_details: { $in: slugs },
    });
    if (existed.length > 0) {
      const existedSlugs = existed.map((e) => e.slug_product_details);
      return ConflictError(`Slug already exists: ${existedSlugs.join(", ")}`);
    }

    // Tự implement rollback
    const insertedIds: string[] = [];
    try {
      for (const input of inputList) {
        const created = await new ProductDetailsModel(input).save();
        insertedIds.push(created.productDetailId.toString());
      }

      const createdDocs = await this.productDetailRepo.getMany({
        productDetailId: { $in: insertedIds },
      });

      return new ProductDetailDto(createdDocs, "[baseUrl]");
    } catch (error: any) {
      // Rollback: Xoá những gì đã insert thành công
      if (insertedIds.length > 0) {
        await this.productDetailRepo.deleteMany({
          productDetailId: { $in: insertedIds },
        });
      }
      throw new Error(error.message);
    }
  }

  public async updateProductDetails(productListData: any[]) {
    const ids = productListData.map((p) => p.productDetailId);

    // Lấy dữ liệu gốc từ DB
    const { data: oldDocs } = await this.productDetailRepo.getMany({
      productDetailId: { $in: ids },
    });

    // Chuẩn bị updateOps và rollbackOps
    const updateOps: { productDetailId: string; updateData: any }[] = [];
    const rollbackOps: { productDetailId: string; oldData: any }[] = [];

    for (const productData of productListData) {
      const oldDoc = oldDocs.find(
        (d) => d.productDetailId === productData.productDetailId
      );

      if (!oldDoc) continue;

      const shouldUpdateSlug =
        productData.name_product_details !== oldDoc?.name_product_details ||
        productData.title_product_details !== oldDoc?.title_product_details;

      const slug = shouldUpdateSlug
        ? createSlug(
            `${productData.name_product_details}-${productData.title_product_details}`
          )
        : oldDoc?.slug_product_details;

      const updateData = autoMapWithClass(productData, ProductDtUpdateDto);

      updateOps.push({
        productDetailId: productData.productDetailId,
        updateData: {
          ...updateData,
          slug_product_details: slug,
          updateDate: new Date(),
        },
      });

      // rollback giữ lại data cũ
      rollbackOps.push({
        productDetailId: oldDoc.productDetailId,
        oldData: oldDoc,
      });
    }

    // Kiểm tra slug trùng
    const slugs = updateOps.map((op) => op.updateData.slug_product_details);
    const { data: existed } = await this.productDetailRepo.getMany({
      slug_product_details: { $in: slugs },
      productDetailId: { $nin: ids },
    });

    if (existed.length > 0) {
      const existedSlugs = existed.map((e) => e.slug_product_details);
      return ConflictError(`Slug already exists: ${existedSlugs.join(", ")}`);
    }

    // Thực hiện update + rollback thủ công nếu lỗi
    try {
      for (const op of updateOps) {
        await this.productDetailRepo.update(
          { productDetailId: op.productDetailId },
          { $set: op.updateData }
        );
      }

      return { status: true };
    } catch (error: any) {
      // Rollback
      for (const rb of rollbackOps) {
        await this.productDetailRepo.update(
          { productDetailId: rb.productDetailId },
          { $set: rb.oldData }
        );
      }
      throw new Error(`Rollback done. Reason: ${error.message}`);
    }
  }

  public async deleteProductDetail(productDetailId: string, code = "P") {
    // 1) Tìm ra product gốc
    const mainProduct = await this.productDetailRepo.getOne({
      productDetailId,
    });

    if (!mainProduct) {
      return null;
    }

    // 2) Xác định các id product detail sẽ bị xoá
    let idsToDelete = [];

    if (code === "P") {
      // Xóa toàn bộ theo referenceKey
      const { data: docs } = await this.productDetailRepo.getMany(
        { referenceKey: mainProduct.referenceKey },
        { productDetailId: 1, _id: 0 },
        {}
      );

      idsToDelete = docs.map((d) => d.productDetailId);
    } else {
      // Chỉ xoá sản phẩm gốc
      idsToDelete = [productDetailId];
    }

    try {
      // 3) Xoá product detail
      const productDeleteResult =
        code === "P"
          ? await this.productDetailRepo.deleteMany({
              referenceKey: mainProduct.referenceKey,
            })
          : await this.productDetailRepo.delete({ productDetailId });

      // 4) Xoá cart item liên quan (nếu có)
      if (idsToDelete.length) {
        await CartModel.deleteMany({
          product_details_id: { $in: idsToDelete },
        });
      }
      return productDeleteResult;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  public async deleteProductDetailTemporary(
    productDetailId: string,
    lang: string = "en"
  ) {
    try {
      const updated = await this.productDetailRepo.update(
        { productDetailId },
        { isDeleted: true }
      );
      if (!updated) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error deleting product detail:", error);
      throw new Error(t(lang, "deleteFailure", "productDetail"));
    }
  }

  public async updateProductDetailTime(
    productDetailId: string,
    lang: string = "en"
  ) {
    try {
      const updateData = await this.productDetailRepo.update(
        { productDetailId },
        { createDate: new Date() }
      );

      if (updateData) {
        return {
          data: Success(updateData, t(lang, "updateSuccess", "productDetail")),
          success: true,
        };
      } else {
        return {
          data: NotfoundError(t(lang, "notFound", "productDetail")),
          success: false,
        };
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật thời gian:", error);
      return {
        data: ExceptionError(t(lang, "updateFailure", "productDetail")),
        success: false,
      };
    }
  }

  public async getProductDetailsWithPromotion(option: InputQuery) {
    // ✅ Chuẩn bị bộ lọc tìm kiếm
    const buildMongo = {
      search: option.search,
      searchKeys: [
        "productCode",
        "name_product_details",
        "slug_product_details",
        "title_product_details",
      ],
      sortList: option.sortList,
      baseFilter: {},
      conditions: option.conditions,
      keyDenied: [],
    };
    const { filter, sort } = buildMongoQuery(buildMongo);
    const { skip, limit } = buildPagination(
      option.pageCurrent,
      option.pageSize,
      100
    );
    const { data: details, total } = await this.productDetailRepo.getMany(
      filter,
      null,
      {
        sort,
        skip,
        limit,
      }
    );

    const listWithProduct = await this.joinProduct(details);

    const finalDetails = await this.joinCategoriesToDetails(listWithProduct);
    const detailsReturn = await this._productExtension.mapProductListV1Async(
      finalDetails
    );
    const mappedProducts = await this.mappingProductPromotion(detailsReturn);

    const productDetailData = ProductDetailDto.fromList(
      mappedProducts,
      "[baseUrl]"
    );
    return {
      listData: productDetailData,
      total: total,
    };
  }

  public async getRevenueProductVsStatistic(option: InputQuery) {
    const buildMongo = {
      search: option.search,
      searchKeys: ["name"],
      sortList: option.sortList,
      baseFilter: { isDeleted: false },
      conditions: option.conditions,
    };
    const { filter, sort } = buildMongoQuery(buildMongo);

    const thisYear = new Date().getFullYear();
    const startOfThisYear = this.startOfYearUTC(thisYear); // 2025-01-01T00:00:00Z
    const startOfLastYear = this.startOfYearUTC(thisYear - 1); // 2024-01-01T00:00:00Z
    const endOfLastYear = startOfThisYear; // 2025-01-01T00:00:00Z

    // Sửa chỗ so sánh thành đúng tên field "createDate" như trong DB
    const matchThisYear = {
      ...filter,
      createDate: { $gte: startOfThisYear },
    };

    const matchLastYear = {
      ...filter,
      updateDate: { $gte: startOfLastYear, $lt: endOfLastYear },
    };

    const [totalThisYear, totalLastYear] = await Promise.all([
      ProductDetailsModel.aggregate([
        { $match: matchThisYear },
        {
          $group: {
            _id: null,
            total: { $sum: 1 }, // Đếm số lượng đơn
          },
        },
      ]),
      ProductDetailsModel.aggregate([
        { $match: matchLastYear },
        {
          $group: {
            _id: null,
            total: { $sum: 1 }, // Đếm số lượng đơn
          },
        },
      ]),
    ]);

    const thisYearRevenue = totalThisYear[0]?.total || 0;
    const lastYearRevenue = totalLastYear[0]?.total || 0;
    const revenueGrowth =
      lastYearRevenue > 0
        ? ((thisYearRevenue - lastYearRevenue) / lastYearRevenue) * 100
        : 100;

    return {
      totalRevenue: thisYearRevenue,
      growthPercent: parseFloat(revenueGrowth.toFixed(2)),
      yearlyIncrease: thisYearRevenue - lastYearRevenue,
    };
  }

  private startOfYearUTC(year: any) {
    return new Date(`${year}-01-01T00:00:00.000Z`);
  }

  private convertGalleryProductV1(galleryProduct: any) {
    if (isNullOrEmpty(galleryProduct)) return galleryProduct;
    let extendParse = JSON.parse(galleryProduct);
    extendParse.gallery_productExtend = JSON.stringify(
      extendParse.gallery_productExtend
    );
    return JSON.stringify(extendParse);
  }

  private async joinProduct(details: any) {
    const productIds = [
      ...new Set(details.map((d: any) => d.productId)),
    ].filter(Boolean);

    const products = await ProductModel.find({
      productId: { $in: productIds }, // ⚠️ Đảm bảo kiểu của id trong DB giống kiểu bạn truyền
      isDeleted: false,
    }).lean();

    const productMap = products.reduce<Record<string, any>>((map, p) => {
      map[p.productId] = {
        productId: p.productId,
        name: p.name,
        gallery_product: p.gallery_product,
        product_extend: this.convertGalleryProductV1(p.product_extend),
        slug: p.slug,
        productCode: p.productCode,
        referenceKey: p.referenceKey,
        description: p.description,
        productType: p.productType,
      };
      return map;
    }, {});

    return details.map((detail: any) => ({
      ...detail,
      product: productMap[detail.productId] || null,
    }));
  }

  private async joinCategoriesToDetails(details: any) {
    const categoryIds: string[] = Array.from(
      new Set(
        details
          .map((p: { categoryId?: string | number }) =>
            p.categoryId?.toString()
          )
          .filter((id: any): id is string => Boolean(id))
      )
    );

    const options: InputQuery = {
      search: "",
      pageCurrent: 1,
      pageSize: 1000,
      conditions: [{ key: "categoryId", value: categoryIds }],
    };
    const { data: response, total } =
      await this.categoriesService.getAllCategories(options);

    const categoryMap = response.reduce(
      (map: Record<string, any>, cat: CategoryDto) => {
        map[cat.customId.categoryId] = {
          categoryId: cat.customId.categoryId,
          name: cat.name,
          slug: cat.slug,
          image_url: cat.image_url,
        };
        return map;
      },
      {}
    );

    return details.map((detail: any) => ({
      ...detail,
      category: categoryMap[detail.categoryId] || null,
    }));
  }

  private async mappingProductPromotion(products: any) {
    const productIds = products.map((cr: any) => cr.productDetailId);

    // Lấy tất cả productPromotion của list product
    const promotions = await ProductPromotionModel.find({
      product_details_id: { $in: productIds },
    }).lean();

    if (promotions.length === 0) return products;

    // Lấy promotion ids
    const promotionIds = promotions.map((p) => p.promotion_id);
    const now = new Date();

    const activePromotions = await PromotionModel.find({
      promotionId: { $in: promotionIds },
      isDeleted: false,
      status: true,
      $and: [
        { $or: [{ start_time: null }, { start_time: { $lte: now } }] },
        { $or: [{ end_time: null }, { end_time: { $gte: now } }] },
      ],
    }).lean();

    const promotionMap: Record<string, any> = {};
    activePromotions.forEach((promo) => {
      promotionMap[promo.promotionId] = promo;
    });

    // Map vào productDetails
    const result = products.map((product: any) => {
      // tất cả promotions liên quan
      const productPromos = promotions.filter(
        (pp) => pp.product_details_id === product.productDetailId
      );

      // lấy promotion hợp lệ
      const validPromos = productPromos
        .map((pp: any) => {
          const promo = promotionMap[pp.promotion_id];
          if (!promo) return null;

          return {
            key: promo.codeName,
            priceSale: pp.priceSale_promotion,
            product_promotion_id: pp.product_promotion_id,
            sale: pp.sale_promotion,
            quantity: pp.quantity_promotion,
            name: promo.name,
          };
        })
        .filter(Boolean);

      if (validPromos.length === 0) {
        return {
          ...product,
          keys: [],
          key: null,
          name: "",
          quantity_promotion: 0,
        };
      }

      // tìm promotion có giá thấp nhất
      const bestPromo = validPromos.reduce((min: any, cur: any) =>
        cur.priceSale < min.priceSale ? cur : min
      );

      const keys = validPromos.map((p: any) => p.key);

      // trả product gốc đã map giá
      return {
        ...product,
        price_sale_product_details: bestPromo?.priceSale,
        sale_promotion: bestPromo?.sale,
        quantity_promotion: bestPromo?.quantity,
        keys,
        key: bestPromo?.key,
        name: bestPromo?.name,
        product_promotion_id: bestPromo?.product_promotion_id,
      };
    });

    return result;
  }
}
