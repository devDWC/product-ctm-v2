// dtos/product-promotion.dto.ts

import { IProductPromotion } from "../../entities/product-promotion.entities";

export class CreateProductPromotionDto {
  /**
   * id chi tiết sản phẩm
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  product_details_id?: string;

  /**
   * id khuyến mãi
   * @example "456e4567-e89b-12d3-a456-426614174111"
   */
  promotion_id?: string;    

  /**
   * id mở rộng chi tiết sản phẩm
   * @example "789e4567-e89b-12d3-a456-426614174222"
   */
  product_details_extendId?: string;

  /**
   * Giá sau khuyến mãi
   * @example 90000
   */
  priceSale_promotion?: number;

  /**
   * Phần trăm giảm giá (%)
   * @example 10
   */
  sale_promotion?: number;

  /**
   * Số lượng áp dụng khuyến mãi
   * @example 100
   */
  quantity_promotion?: number;

  /**
   * Đã bán
   * @example 20
   */
  sold?: number;

  /**
   * action để thêm hoặc cập nhật
   * @example "create"
   */
  action?: "create" | "update";
}

export class ProductPromotionDto {
  productPromotionId?: string;
  product_details_id?: string;
  promotion_id?: string;
  product_details_extendId?: string;
  priceSale_promotion?: number;
  sale_promotion?: number;
  quantity_promotion?: number;
  sold?: number;
  customId?: object;

  constructor(data: Partial<IProductPromotion>) {
    this.customId = {
      mongoId: data._id,
      productPromotionId: data.productPromotionId,
    };
    this.productPromotionId = data.productPromotionId || "";
    this.product_details_id = data.product_details_id || "";
    this.promotion_id = data.promotion_id || "";
    this.product_details_extendId = data.product_details_extendId || "";
    this.priceSale_promotion = data.priceSale_promotion || 0;
    this.sale_promotion = data.sale_promotion || 0;
    this.quantity_promotion = data.quantity_promotion || 0;
    this.sold = data.sold || 0;
  }
}
