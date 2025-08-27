//src/services/mgo-services/product-service/admin/product.admin.service.ts
import { t } from "../../../../locales";
import { InputQuery } from "../../../../model/base/input-query.dto";
import {
  CreateProductDto,
  IProductWithCategory,
  IResult,
  ProductDto,
  ProductUpdateDto,
  UpdateProductDto,
} from "../../../../model/dto/product/product.dto";
import { CartModel } from "../../../../model/entities/cart.entities";
import { ProductDetailsModel } from "../../../../model/entities/product-detail.entities";
import {
  IProduct,
  ProductModel,
} from "../../../../model/entities/product.entities";
import { ProductRepository } from "../../../../repository/mgo-repository/product-repository/product.repository";
import { ProductExtension } from "../../../../shared/functions/product-extensions";
import { cloneDeep } from "../../../../shared/functions/utility-functions";
import { autoMapWithClass } from "../../../../shared/utils/autoMap-untility";
import {
  buildMongoQuery,
  buildPagination,
} from "../../../../shared/utils/mgo.utility";
import unitOfWork from "../../../../shared/utils/unitOfWork";
import { S3Service } from "../../../helper-services/s3.service";
import { isNullOrEmpty } from "../../../helper-services/sp-service";
import { v4 as uuidv4 } from "uuid";
import { CategoryService } from "../../categories-service/admin/category.admin.service";
import { CategoryInfo } from "../../../../model/dto/category/category.dto";
export class ProductService {
  private productRepo: ProductRepository;
  private readonly _s3Service = new S3Service();
  private readonly _productExtension = new ProductExtension();
  private readonly categoriesService = new CategoryService();

  constructor() {
    this.productRepo = new ProductRepository();
  }

  public async checkIsValidProductInTenantId(
    listProduct: any,
    tenantId: number
  ) {
    if (tenantId === 0 || listProduct.length === 0) return listProduct;

    // Lấy danh sách ID cần kiểm tra
    const productIds = [
      ...new Set(listProduct.map((p: any) => p.productId).filter(Boolean)),
    ];

    // Tìm các ProductDetails tồn tại ở chi nhánh tương ứng
    const existingDetails = await ProductDetailsModel.find({
      tenantId: tenantId,
      productId: { $in: productIds },
    })
      .select("productId")
      .lean();

    // Tạo set các productId hợp lệ để so sánh nhanh
    const validProductIdSet = new Set(
      existingDetails.map((d) => d.productId.toString())
    );

    // Gắn thêm trường isValid vào từng sản phẩm
    return listProduct.map((product: any) => ({
      ...product,
      isValid: validProductIdSet.has(product.productId.toString()),
    }));
  }

  public async joinCategories(products: any, pageSize: number) {
    const categoryIds: string[] = Array.from(
      new Set(
        products
          .map((p: { categoryId?: string | number }) =>
            p.categoryId?.toString()
          )
          .filter((id: any): id is string => Boolean(id))
      )
    );

    const options: InputQuery = {
      search: "",
      pageCurrent: 1,
      pageSize: pageSize,
      conditions: [{ key: "categoryId", value: categoryIds }],
    };
    const response = await this.categoriesService.getAllCategories(options);
    const categoryMap = response.data.reduce<Record<string, CategoryInfo>>(
      (map, cat) => {
        map[cat.customId?.categoryId] = {
          categoryId: cat.customId?.categoryId,
          name: cat.name,
          slug: cat.slug,
        };
        return map;
      },
      {}
    );

    // Gộp dữ liệu vào từng sản phẩm
    return products.map((product: any) => ({
      ...product,
      category: categoryMap[Number(product.categoryId)] || null,
    }));
  }

  private getTenantIdValue(
    conditions?: { key: string; value: string | number | (string | number)[] }[]
  ) {
    const condition = conditions?.find((c) => c.key === "tenantId");
    return condition ? condition.value : undefined;
  }

  /**
   * Lấy danh sách tất cả products
   */
  public async getAllProducts(option: InputQuery): Promise<{
    data: ProductDto[];
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

    const { data, total } = await this.productRepo.getMany(filter, null, {
      sort,
      skip,
      limit,
    });

    let tenantId = this.getTenantIdValue(option.conditions);
    tenantId = tenantId ? Number(tenantId) : 0;

    const listProductCheck = await this.checkIsValidProductInTenantId(
      data,
      tenantId
    );
    const listDataWithExtend = await this._productExtension.mapProductListV1(
      listProductCheck
    );

    // B3: Gộp category
    const products = await this.joinCategories(
      listDataWithExtend,
      option.pageSize || 10
    );

    const mapped = (products as IProductWithCategory[]).map(
      (c: IProductWithCategory) => new ProductDto(c)
    );
    return { data: mapped, total };
  }

  /**
   * Lấy product theo productId
   */
  public async getProductById(productId: string): Promise<ProductDto | null> {
    const product = await this.productRepo.getOne({
      productId,
      isDeleted: false,
    });

    if (product) {
      const productWithCategory = await this.joinCategories([product], 10);
      return productWithCategory
        ? new ProductDto(productWithCategory[0] as IProductWithCategory)
        : null;
    } else {
      return null;
    }
  }

  /**
   * Lấy product theo categoryId có pagination
   */
  public async getProductsByCategoryId(
    categoryId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: ProductDto[];
    total: number;
  }> {
    const skip = (page - 1) * limit;

    const { data, total } = await this.productRepo.getMany(
      { categoryId, isDeleted: false },
      null,
      {
        sort: { createDate: -1 },
        skip,
        limit,
      }
    );

    const listProductCheck = await this.checkIsValidProductInTenantId(data, 0);
    const listDataWithExtend = await this._productExtension.mapProductListV1(
      listProductCheck
    );

    // B3: Gộp category
    const products = await this.joinCategories(listDataWithExtend, 10);

    const mapped = (products as IProductWithCategory[]).map(
      (c: IProductWithCategory) => new ProductDto(c)
    );
    return { data: mapped, total };
  }

  /**
   * Create a new product
   * @param {Object} productData
   * @returns {Promise<Object>}
   */
  public async createProduct(productData: CreateProductDto) {
    try {
      const allProducts = await this.createFullProduct(productData);
      return allProducts.map((p) => new ProductDto(p)); // Trả về sản phẩm chính
    } catch (err: any) {
      throw new Error("Error in createProduct: " + err.message);
    }
  }

  // tạo nhiều sản phẩm
  public async createFullProduct(productData: CreateProductDto) {
    const createdCodes = []; // Để rollback ảnh

    try {
      productData.referenceKey = uuidv4();
      productData.product_extend = isNullOrEmpty(productData.product_extend)
        ? ""
        : productData.product_extend;

      const productDataClone = cloneDeep(productData);
      const { variantDocs, productExtend } =
        await this._productExtension.prepareVariantsV1(
          productData.product_extend,
          productData.gallery_productExtend,
          productDataClone
        );
      if (productExtend) {
        for (const v of variantDocs) createdCodes.push(v.productCode);
        // productData.product_extend = JSON.stringify(productExtend);
      }

      const productDoc = await this._productExtension.prepareMainProductV1(
        productData,
        productData.gallery_product
      );
      createdCodes.push(productDoc.productCode);

      const allDocs = productExtend
        ? [productDoc, ...variantDocs]
        : [productDoc];

      try {
        await ProductModel.insertMany(allDocs);
      } catch (err) {
        throw err;
      }

      return allDocs.map((p) => p.toObject());
    } catch (error: any) {
      // Rollback ảnh nếu cần
      for (const code of createdCodes) {
        await this._s3Service.deleteFolder("productTest", code);
      }
      throw new Error("Rollback toàn bộ transaction: " + error.message);
    }
  }

  private cleanUpdateData(oldData: any, newData: any) {
    const cleaned = { ...newData };

    // Nếu slug không đổi, thì bỏ ra khỏi cleaned
    if (oldData.slug === newData.slug) {
      delete cleaned.slug;
    }

    // Nếu meta_slug không đổi, thì bỏ ra luôn (tuỳ bạn dùng hay không)
    if (oldData.meta_slug === newData.meta_slug) {
      delete cleaned.meta_slug;
    }

    return cleaned;
  }

  // cập nhật sản phẩm
  public async updateProduct(productId: string, newData: UpdateProductDto) {
    const createdCodes: string[] = [];

    return unitOfWork
      .runInTransaction(async (session: any) => {
        const existingProduct = await ProductModel.findOne({ productId });
        if (!existingProduct) throw new Error("Product not found");

        // Cập nhật thông tin sản phẩm chính
        const updatedMain = await this._productExtension.updateMainProduct(
          existingProduct.toObject(),
          newData,
          newData.gallery_product
        );
        createdCodes.push(updatedMain.productCode);
        const updateData = cloneDeep(updatedMain);

        // Đồng bộ biến thể: tách rõ created vs updated
        const { updatedVariants, createdVariants } =
          await this._productExtension.syncVariants(
            newData.product_extend,
            newData.gallery_productExtend,
            updateData
          );

        // ✅ Gộp danh sách biến thể thành product_extend mới
        const allVariants = [...updatedVariants, ...createdVariants];

        const updatedVariantIds = allVariants.map((v) => v.id);
        for (const v of allVariants) {
          createdCodes.push(v.productCode);
        }

        const gallery_productExtend = allVariants
          .map((v) => {
            const gallery = v.updateData?.gallery_product;
            const parsedGallery =
              typeof gallery === "string" ? JSON.parse(gallery) : gallery;
            return parsedGallery?.[0] || null;
          })
          .filter(Boolean);

        const productListExtend = allVariants.map((v, idx) => ({
          extendIndex: idx + 1,
          extend: {
            id: v.id,
            title: v.updateData?.title || "",
            unit: v.updateData?.unit || "",
            price: v.updateData?.price || 0,
            sale: v.updateData?.sale || 0,
            priceSale: v.updateData?.priceSale || v.updateData?.price || 0,
            productCode:
              v.updateData?.productCode || v.updateData?.productCode || 0,
          },
        }));

        updatedMain.product_extend =
          gallery_productExtend.length && productListExtend
            ? JSON.stringify({
                gallery_productExtend,
                productListExtend,
              })
            : "";

        // Cập nhật sản phẩm chính
        const safeUpdate = this.cleanUpdateData(
          existingProduct.toObject(),
          updatedMain
        );
        const safeUpdateFinal = autoMapWithClass(safeUpdate, ProductUpdateDto);

        try {
          await ProductModel.findOneAndUpdate(
            { productId },
            { $set: safeUpdateFinal },
            { session, new: true }
          );
        } catch (error) {
          console.log("Error updating main product:", error);
          throw error;
        }

        // Cập nhật các biến thể cũ
        try {
          for (const variant of updatedVariants) {
            const old = await ProductModel.findOne({ productId: variant.id });
            const variantUpdate = this.cleanUpdateData(
              old?.toObject() || {},
              variant.updateData
            );
            const variantUpdateInput = autoMapWithClass(
              variantUpdate,
              ProductUpdateDto
            );
            await ProductModel.findOneAndUpdate(
              { productId: variant.id },
              { $set: variantUpdateInput },
              { upsert: true, session }
            );
          }

          // Tạo mới các biến thể mới
          for (const variant of createdVariants) {
            await ProductModel.create([variant.updateData], { session });
          }

          //Xoá biến thể không còn tồn tại
          await ProductModel.updateMany(
            {
              referenceKey: new RegExp(`^${updatedMain.referenceKey}-V`),
              productId: { $nin: updatedVariantIds },
            },
            { $set: { isDeleted: true } },
            { session }
          );
        } catch (error) {
          console.log("Error updating or creating variants:", error);
          throw error;
        }

        return updatedMain;
      })
      .catch(async (err) => {
        // Rollback S3 folder nếu có lỗi trong transaction
        for (const code of [productId, ...createdCodes]) {
          await this._s3Service.deleteFolder("productTest", code);
        }
        throw new Error("Rollback toàn bộ transaction: " + err.message);
      });
  }

  // cập nhật status cho sản phẩm
  public async updateStatus(
    productId: string,
    status: string,
    lang: string = "en"
  ) {
    try {
      const updated = await ProductModel.findOneAndUpdate(
        { productId },
        { $set: { status } },
        { upsert: true }
      );

      if (!updated) {
        return {
          success: false,
          message: t(lang, "notFound", "product"),
        };
      }

      return {
        success: true,
        message: t(lang, "updateSuccess", "product"),
        data: new ProductDto(updated),
      };
    } catch (error: any) {
      console.error("Lỗi khi cập nhật trạng thái sản phẩm:", error);
      return {
        success: false,
        message: t(lang, "updateFailure", "product"),
        error: error.message,
      };
    }
  }

  private reNewIndex(updatedProductExtend: any) {
    updatedProductExtend.productListExtend =
      updatedProductExtend.productListExtend.map(
        (item: any, newIndex: number) => ({
          ...item,
          extendIndex: newIndex + 1, // Đánh lại index từ 1
        })
      );
    return JSON.stringify(updatedProductExtend);
  }

  private async updateProductSrc(productExtend: any) {
    try {
      const mainProduct = await ProductModel.findOne({
        referenceKey: productExtend.referenceKey,
        productType: "product-source",
      }).lean();
      const productExtendParsed = !isNullOrEmpty(mainProduct?.product_extend)
        ? JSON.parse(mainProduct?.product_extend || "[]")
        : null;
      if (!productExtendParsed) return null;
      const imgName = productExtend.image_url.split("/").pop();
      const gallery_productExtend = productExtendParsed.gallery_productExtend;
      const productListExtend = productExtendParsed.productListExtend;
      const updatedProductExtend = {
        gallery_productExtend: gallery_productExtend.filter(
          (item: any) => item !== imgName
        ),
        productListExtend: productListExtend.filter(
          (item: any) => item.extend.id !== productExtend.id
        ),
      };

      const finishUpdate =
        updatedProductExtend.gallery_productExtend.length > 0 ||
        updatedProductExtend.productListExtend.length > 0
          ? this.reNewIndex(updatedProductExtend)
          : "";
      const updatedProduct = await ProductModel.findOneAndUpdate(
        { productId: mainProduct?.productId },
        { $set: { product_extend: finishUpdate } },
        { new: true }
      );
      return updatedProduct;
    } catch (error) {
      console.error("Lỗi khi cập nhật sản phẩm nguồn:", error);
      return undefined;
    }
  }

  // xóa mềm sản phẩm
  public async deleteSoftProduct(
    productId: string,
    code: string = "P",
    lang: string = "en"
  ) {
    try {
      const mainProduct = await ProductModel.findOne({ productId }).lean();
      if (!mainProduct) throw new Error(t(lang, "notFound", "product"));

      if (code === "P") {
        // Xoá toàn bộ theo referenceKey
        const listProductByReferenceKey = await ProductModel.find({
          referenceKey: mainProduct.referenceKey,
        }).select("productCode productId");

        const listIds = listProductByReferenceKey.map((p) => p.productId);

        const details = await ProductDetailsModel.find(
          { productId: { $in: listIds } },
          { productDetailId: 1, _id: 0 }
        ).lean();
        const detailIds = details.map((d) => d.productDetailId);

        // Xoá mềm ProductDetails liên quan đến tất cả id
        await ProductDetailsModel.updateMany(
          { productId: { $in: listIds } },
          { $set: { isDeleted: true } }
        );

        // trong cart ko có isDeleted, (xóa cứng ?)
        if (detailIds.length) {
          await CartModel.deleteMany({
            product_details_id: { $in: detailIds },
          });
        }
        // Xoá sản phẩm
        return await ProductModel.updateMany(
          { referenceKey: mainProduct.referenceKey },
          { $set: { isDeleted: true } }
        );
      }

      const detailFilter = {
        productCode: { $regex: `${mainProduct.productCode}$` },
      };

      // ---> LẤY ID TRƯỚC
      const singleDetails = await ProductDetailsModel.find(detailFilter, {
        productDetailId: 1,
        _id: 0,
      }).lean();
      const singleIds = singleDetails.map((d) => d.productDetailId);

      // xóa cứng cart ?
      if (singleIds.length) {
        await CartModel.deleteMany({
          product_details_id: { $in: singleIds },
        });
      }

      await ProductDetailsModel.updateMany(
        { productCode: { $regex: `${mainProduct.productCode}$` } },
        { $set: { isDeleted: true } }
      );
      await ProductModel.findOneAndUpdate(
        { productId },
        { $set: { isDeleted: true } }
      );
      return true;
    } catch (error) {
      console.error(t(lang, "deleteFailure", "product"), error);
      throw new Error(t(lang, "deleteFailure", "product"));
    }
  }

  // xóa sản phẩm ra khỏi db
  public async deleteHardProduct(
    productId: string,
    code: string = "P",
    lang: string = "en"
  ): Promise<IResult> {
    const result: IResult = {
      status: true,
      message: "Xoá sản phẩm thành công",
      productUpdate: undefined,
    };
    try {
      const mainProduct = await ProductModel.findOne({ productId }).lean();
      if (!mainProduct) {
        result.status = false;
        result.message = t(lang, "notFound", "product");
        return result;
      }

      if (code === "P") {
        // Xoá toàn bộ theo referenceKey
        const listProductByReferenceKey = await ProductModel.find({
          referenceKey: mainProduct.referenceKey,
        }).select("productCode productId");

        // Xoá ảnh trên S3
        for (const product of listProductByReferenceKey) {
          if (product.productCode) {
            await this._s3Service.deleteFolder(
              "productTest",
              product.productCode
            );
          }
        }

        const listIds = listProductByReferenceKey.map((p) => p.productId);

        const details = await ProductDetailsModel.find(
          { productId: { $in: listIds } },
          { productDetailId: 1, _id: 0 }
        ).lean();

        const detailIds = details.map((d) => d.productDetailId);

        // Xoá ProductDetails liên quan đến tất cả id

        await ProductDetailsModel.deleteMany({
          productId: { $in: listIds },
        });

        if (detailIds.length) {
          await CartModel.deleteMany({
            product_details_id: { $in: detailIds },
          });
        }
        // Xoá sản phẩm
        await ProductModel.deleteMany({
          referenceKey: mainProduct.referenceKey,
        });

        return result;
      }

      // Nếu không phải xoá theo nhóm
      if (mainProduct.productType != "product-source") {
        result.productUpdate =
          (await this.updateProductSrc(mainProduct)) || undefined;
      }
      if (mainProduct.productCode) {
        await this._s3Service.deleteFolder(
          "productTest",
          mainProduct.productCode
        );
      }

      const detailFilter = {
        productCode: { $regex: `${mainProduct.productCode}$` },
      };

      // ---> LẤY ID TRƯỚC
      const singleDetails = await ProductDetailsModel.find(detailFilter, {
        productDetailId: 1,
        _id: 0,
      }).lean();
      const singleIds = singleDetails.map((d) => d.productDetailId);

      if (singleIds.length) {
        await CartModel.deleteMany({
          product_details_id: { $in: singleIds },
        });
      }

      await ProductDetailsModel.deleteMany({
        productCode: { $regex: `${mainProduct.productCode}$` },
      });
      await ProductModel.deleteOne({ productId });
      return result;
    } catch (error) {
      console.error(t(lang, "deleteFailure", "product"), error);
      result.status = false;
      result.message = t(lang, "deleteFailure", "product");
      result.productUpdate = undefined;
      return result;
    }
  }
}
