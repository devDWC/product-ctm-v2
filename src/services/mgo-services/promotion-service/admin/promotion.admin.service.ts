import { t } from "../../../../locales";
import { InputQuery } from "../../../../model/base/input-query.dto";
import { ProductDetailDto } from "../../../../model/dto/product-detail/product-detail.dto";
import {
  CreateProductPromotionDto,
  ProductPromotionDto,
} from "../../../../model/dto/promotion/product-promotion.dto";
import { CreatePromotionUserLimitDto, PromotionUserLimitDto, VerifyPromotionDto } from "../../../../model/dto/promotion/promotion-user-limit.dto";
import {
  CreatePromotionDto,
  PromotionDto,
} from "../../../../model/dto/promotion/promotion.dto";
import { ProductDetailsModel } from "../../../../model/entities/product-detail.entities";
import { ProductPromotionModel } from "../../../../model/entities/product-promotion.entities";
import { PromotionUserLimitModel } from "../../../../model/entities/promotion-user-limit";
import { PromotionRepository } from "../../../../repository/mgo-repository/promotion-repository/promotion.repository";
import { ProductExtension } from "../../../../shared/functions/product-extensions";
import {
  buildMongoQuery,
  buildPagination,
} from "../../../../shared/utils/mgo.utility";
import { ProcessError } from "../../../../shared/utils/response.utility";
import { v4 as uuidv4 } from "uuid";

export class PromotionService {
  private promotionRepo: PromotionRepository;
  private readonly _productExtension = new ProductExtension();

  constructor() {
    this.promotionRepo = new PromotionRepository();
  }

  // Lấy chương trình khuyến mãi
  public async getPromotionById(promotionId: string) {
    const promotion = await this.promotionRepo.getOne({
      promotionId,
      isDeleted: false,
    });

    if (promotion) {
      return new PromotionDto(promotion);
    }

    return null;
  }

  // Lấy các chương trình khuyến mãi có phân trang và search
  public async getPromotionsPagination(option: InputQuery) {
    const mongoBuild = {
      search: option.search,
      searchKeys: ["name", "description", "codeName"],
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

    const { data, total } = await this.promotionRepo.getMany(filter, null, {
      sort,
      skip,
      limit,
    });

    const mapped = data.map((p) => new PromotionDto(p));
    return { data: mapped, total };
  }

  // Lấy danh sách sản phẩm trong chương trình khuyến mãi còn hạn
  public async getProductDetailsInPromotion(
    promotionId: string,
    pageCurrent: number,
    pageSize: number
  ) {
    // Bước 1: Lấy promotion active
    const now = new Date();
    const promotion = await this.promotionRepo.getOne({
      promotionId,
      status: true,
      start_time: { $lte: now },
      end_time: { $gte: now },
      isDeleted: false,
    });
    if (!promotion) return {data: [], total: 0};

    // Bước 2: Lấy danh sách product_details_id
    const { productDetailIds, total } =
      await this.getProductDetailIdsByPromotion(
        promotionId,
        pageSize,
        pageCurrent
      );
    if (productDetailIds.length === 0) return {data: [], total: 0};

    const productDetails = await this.getProductDetailsByIds(productDetailIds);

    const listWithProduct = await this._productExtension.joinProduct(
      productDetails
    );
    const finalDetails = await this._productExtension.joinCategoriesToDetails(
      listWithProduct
    );
    const detailsReturn = await this._productExtension.mapProductListV1Async(
      finalDetails
    );

    const mappedProducts = await this.mappingProductPromotion(
      detailsReturn,
      promotion
    );

    const productDetailData = ProductDetailDto.fromList(
      mappedProducts,
      "[baseUrl]"
    );

    return { data: productDetailData, total };
  }

  // Lấy danh sách sản phẩm trong chương trình khuyến mãi
  public async getProductDetailsPromotion(
    promotionId: string,
    tenantId: number,
    pageSize: number,
    pageCurrent: number
  ) {
    // Bước 1: Lấy promotion active
    const promotion = await this.promotionRepo.getOne({
      promotionId,
      tenantId,
      isDeleted: false,
    });
    if (!promotion) return { data: [], total: 0 }; // không có promotion nào hợp lệ

    // Bước 2: Lấy danh sách product_details_id
    const { productDetailIds, total } =
      await this.getProductDetailIdsByPromotion(
        promotionId,
        pageSize,
        pageCurrent
      );
    if (productDetailIds.length === 0) return { data: [], total: 0 };

    // Bước 3: Lấy danh sách ProductDetails
    const productDetails = await this.getProductDetailsByIds(productDetailIds);

    const listWithProduct = await this._productExtension.joinProduct(
      productDetails
    );
    const finalDetails = await this._productExtension.joinCategoriesToDetails(
      listWithProduct
    );
    const detailsReturn = await this._productExtension.mapProductListV1Async(
      finalDetails
    );
    const mappedProducts = await this.mappingProductPromotion(
      detailsReturn,
      promotion
    );

    const productDetailData = ProductDetailDto.fromList(
      mappedProducts,
      "[baseUrl]"
    );
    return {
      data: productDetailData,
      total: total,
    };
  }

  // Tạo mới một chương trình khuyến mãi
  public async createPromotion(promotion: CreatePromotionDto) {
    const promo = await this.promotionRepo.create(promotion, {
      codeName: promotion.codeName,
    });

    if (promo) {
      return new PromotionDto(promo);
    }
    return null;
  }

  // Cập nhật lại chương trình khuyến mãi
  public async updatePromotion(
    promotionId: string,
    promotion: CreatePromotionDto
  ) {
    const res = await this.promotionRepo.update(
      { promotionId, isDeleted: false },
      promotion
    );

    if (!res) {
      return null;
    }

    await PromotionUserLimitModel.deleteMany({ promotionId });
    return new PromotionDto(res);
  }

  //Xóa mềm Promotion
  public async deletePromotion(promotionId: string) {
    try {
      const deleted = await this.promotionRepo.update(
        { promotionId, isDeleted: false },
        { isDeleted: true }
      );

      if (!deleted) {
        return null;
      }

      return new PromotionDto(deleted);
    } catch (error: any) {
      console.error("Lỗi khi xóa Promotion:", error);
      throw new Error(error.message);
    }
  }

  // Tạo hoặc cập nhật product promotion
  public async createOrUpdateProductPromotion(
    productPromotion: CreateProductPromotionDto,
    lang = "vi"
  ) {
    try {
      // Chuẩn hóa action về lowercase
      const action = (productPromotion.action || "").toLowerCase();

      // Tìm bản ghi hiện tại dựa trên product_details_id + promotion_id
      const existingPromotion: Record<string, any> | null =
        await ProductPromotionModel.findOne({
          product_details_id: productPromotion.product_details_id,
          promotion_id: productPromotion.promotion_id,
        });

      if (action === "create") {
        if (existingPromotion) {
          return ProcessError(
            "Error",
            400,
            undefined,
            t(lang, "existing", "productPromotion")
          );
        }

        // loại bỏ action & id do client gửi lên
        const { action: _a, ...payload } = productPromotion;
        const doc = await ProductPromotionModel.create({
          ...this.removeUndefined(payload),
          productPromotionId: uuidv4(),
        });

        return new ProductPromotionDto(doc);
      }

      // action === "update"
      if (!existingPromotion) {
        return ProcessError(
          "Error",
          404,
          undefined,
          t(lang, "notFound", "productPromotion")
        );
      }

      // Cập nhật các trường
      const { action: _a, ...updates } = productPromotion;
      const sanitized = this.removeUndefined(updates);

      const updated = await ProductPromotionModel.findByIdAndUpdate(
        (existingPromotion as any)._id,
        { $set: sanitized },
        { new: true }
      );

      return new ProductPromotionDto(updated as any);
    } catch (error: any) {
      throw new Error(
        `${t(lang, "saveFailed", "productPromotion")}: ${
          error.message || error
        }`
      );
    }
  }

  // Xóa một product promotion
  public async deleteProductPromotion(
    productPromotionId: string,
    lang: string = "en"
  ) {
    try {
      const promotion = await ProductPromotionModel.findOne({
        productPromotionId,
      });

      if (!promotion) {
        return false;
      }

      // Xóa
      await ProductPromotionModel.deleteOne({ productPromotionId });

      return true;
    } catch (error: any) {
      throw new Error(
        `${t(lang, "deleteFailed", "productPromotion")}: ${
          error.message || error
        }`
      );
    }
  }

  // Kiểm tra một chương trình khuyến mãi đủ điều kiện ko
  public async verifyPromotion(promotionInfo: VerifyPromotionDto, lang: string = "en") {
    const results = [];

    for (const proDt of promotionInfo.productDt) {
      const errors = []; // chứa các lỗi của sản phẩm này

      const promotion = await this.promotionRepo.getOne({
        promotionId: proDt.promotionId,
      });

      // Kiểm tra ngày hết hạn
      const dateExpire = this.verifyPromotionExpire(promotion, lang);
      if (dateExpire) {
        errors.push(dateExpire);
      }

      // Kiểm tra số lượng sản phẩm promotion còn lại
      const amountExit = await this.verifyPromotionAmountExit(proDt, lang);
      if (amountExit) {
        errors.push(amountExit);
      }

      // Kiểm tra giới hạn số lượng mua của người dùng
      const amountLimit = await this.verifyPromotionAmountLimit(
        promotion,
        proDt.amount,
        promotionInfo.phone,
        lang
      );
      if (amountLimit) {
        errors.push(amountLimit);
      }

      // Nếu sản phẩm này có ít nhất 1 lỗi
      if (errors.length > 0) {
        results.push({
          valid: false,
          productDt: proDt,
          errors, // danh sách lỗi
        });
      }
    }

    return results;
  }

  // Kiểm tra xem promotion còn hạn ko
  private verifyPromotionExpire(promotion: any, lang: string = "en") {
    const now = new Date();

    if (!promotion) {
      // Không tìm thấy promotion
      return t(lang, "notFound", "promotion");
    }

    if (promotion.isDeleted) {
      // Promotion đã bị xóa
      return t(lang, "isDelete", "promotion");
    }

    if (promotion.end_time && promotion.end_time < now) {
      // Promotion đã hết hạn
      return t(lang, "expire", "promotion");
    }

    if (!promotion.start_time || promotion.start_time > now) {
      // Promotion chưa bắt đầu
      return t(lang, "nonStart", "promotion");
    }

    return "";
  }

  // Tạo promotion lưu thông tin user được phép mua bao nhiêu sản phẩm
  public async createPromotionUserLimit(promotionUser: CreatePromotionUserLimitDto, lang = "vi") {
    try {
      const promotion = await this.promotionRepo.getOne({
        promotionId: promotionUser.promotionId,
        isDeleted: false,
      });

      if (!promotion) {
        return ProcessError(
          "Error",
          400,
          undefined,
          t(lang, "cannotFind", "promotion")
        );
      } else {
      }

      if (promotion.limit_items < promotionUser.amount) {
        return ProcessError(
          "Error",
          400,
          undefined,
          `${t(lang, "buyLimit", "promotion")} ${promotion.limit_items} ${t(
            lang,
            "product",
            "promotion"
          )}`
        );
      }

      let promoUser = await PromotionUserLimitModel.findOne({
        promotionId: promotionUser.promotionId,
        phone: promotionUser.phone,
        isDeleted: false,
      });

      if (promoUser) {
        const newAmount = promoUser.amount + promotionUser.amount;

        if (newAmount > promotion.limit_items) {
          return ProcessError(
            "Error",
            400,
            undefined,
            `${t(lang, "buyLimit", "promotion")} ${promotion.limit_items} ${t(
              lang,
              "product",
              "promotion"
            )}`
          );
        }

        promoUser.amount = newAmount;
        promoUser.lastPurchaseAt = new Date();
        await promoUser.save();

        return new PromotionUserLimitDto(promoUser);
      } else {
        const newPromoUser = await PromotionUserLimitModel.create({
          ...promotionUser,
          promotionUserLimitId: uuidv4(),
        });

        return new PromotionUserLimitDto(newPromoUser);
      }
    } catch (error: any) {
      // Đây mới là lỗi exception thực sự
      throw new Error(
        `${t(lang, "createFailed", "productPromotion")}: ${
          error.message || error
        }`
      );
    }
  }

  // Kiểm tra số lượng promotion có hợp lệ ko
  private async verifyPromotionAmountExit(
    productDetail: any,
    lang: string = "en"
  ) {
    const productDtPromotion = await ProductPromotionModel.findOne({
      productPromotionId: productDetail.productPromotionId,
    });

    if (
      productDtPromotion &&
      productDtPromotion.quantity_promotion - productDtPromotion.sold <
        productDetail.amount
    ) {
      return `${t(lang, "overPass", "promotion")} ${
        productDtPromotion.quantity_promotion
      }`;
    }
    return "";
  }

  // Kiểm tra giới hạn số lượng sản phẩm được phép mua trong mỗi promotion
  private async verifyPromotionAmountLimit(
    promotion: any,
    amount: number,
    phone: string,
    lang: string = "en"
  ) {
    if (promotion.limit_items < amount) {
      return `${t(lang, "overPass", "promotion")} ${promotion.limit_items}`;
    }

    const promotionUserLimit = await PromotionUserLimitModel.findOne({
      promotionId: promotion.promotionId,
      phone: phone,
    });

    if (
      promotionUserLimit &&
      promotion.limit_items < promotionUserLimit.amount + amount
    ) {
      return `${t(lang, "allowBuy", "promotion")} ${promotion.limit_items} ${t(
        lang,
        "buying",
        "promotion"
      )} ${promotionUserLimit.amount} ${t(lang, "product", "promotion")}`;
    } else {
      return "";
    }
  }

  private removeUndefined<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined)
    ) as Partial<T>;
  }

  private async getProductDetailIdsByPromotion(
    promotionId: string,
    pageSize: number,
    pageCurrent: number
  ) {
    const total = await ProductPromotionModel.countDocuments({
      promotion_id: promotionId,
    });

    const promotions = await ProductPromotionModel.find({
      promotion_id: promotionId,
    })
      .select("product_details_id -_id")
      .skip((pageCurrent - 1) * pageSize)
      .limit(pageSize);

    // Lấy mảng string
    const productDetailIds = promotions.map((p) => p.product_details_id);
    return { productDetailIds, total };
  }

  private async getProductDetailsByIds(productDetailIds: any) {
    if (!productDetailIds || productDetailIds.length === 0) return [];

    const productDetails = await ProductDetailsModel.find({
      productDetailId: { $in: productDetailIds },
      isDeleted: false,
    }).lean();

    return productDetails;
  }

  private async mappingProductPromotion(products: any, promotion: any) {
    if (!products || products.length === 0) return [];

    const productIds = products.map((p: any) => p.productDetailId);

    // Lấy ProductPromotion cho các productIds trong promotion này
    const productPromotions = await ProductPromotionModel.find({
      promotion_id: promotion.promotionId,
      product_details_id: { $in: productIds },
    }).lean();

    // Map ProductPromotion theo product_details_id
    const promoMap: Record<string, any> = {};
    productPromotions.forEach((pp) => {
      promoMap[pp.product_details_id] = pp;
    });

    // Map giá vào sản phẩm
    const result = products.map((product: any) => {
      const pp = promoMap[product.productDetailId];

      if (!pp) {
        return {
          ...product,
          keys: [],
          key: null,
          name: "",
          quantity_promotion: 0,
        };
      }

      return {
        ...product,
        price_sale_product_details: pp.priceSale_promotion,
        sale_product_details: pp.sale_promotion,
        quantity_promotion: pp.quantity_promotion,
        product_promotion_id: pp.productPromotionId,
        quantity: pp.sold,
        keys: [promotion.codeName],
        key: promotion.codeName,
        name: promotion.name,
      };
    });

    return result;
  }
}
