// cart.dto.ts
import { ICart } from "./../../entities/cart.entities";

class ProductDetail {
  /**
   * id sản phẩm
   * @example "06fa7fa8-2bc9-44b8-a02f-ee9f7a31a45b"
   */
  productDetailId?: string;

  /**
   * số lượng sản phẩm trong giỏ
   * @example 2
   */
  quantity?: number;

  /**
   * mã sản phẩm
   * @example "B3-P0002055"
   */
  productCode?: string;

  /**
   * mã liên kết sản phẩm
   * @example "08ebed19-763c-4976-b2a0-5fadf73b8888"
   */
  referenceKey?: string;

  /**
   * tenantId
   * @example 101
   */
  tenantId?: number;
}

export class CreateOneCartDto extends ProductDetail {
  /**
   * id của người dùng
   * @example "d33e2af5-a8e0-4802-b8b0-3ab3d1e7bc92"
   */
  userId?: string;
}

export class CreateCartDto {
  /**
   * id của người dùng
   * @example "d33e2af5-a8e0-4802-b8b0-3ab3d1e7bc92"
   */
  userId?: string;

  /**
   * danh sách sản phẩm
   * @example [{
   *   "productDetailId": "06fa7fa8-2bc9-44b8-a02f-ee9f7a31a45b",
   *   "quantity": 2,
   *   "productCode": "B3-P0002055",
   *   "referenceKey": "08ebed19-763c-4976-b2a0-5fadf73b8888",
   *   "tenantId": 101
   * }]
   */
  productDetails: ProductDetail[] = [];
}

export class CartDto {
  userId?: string;
  tenantId?: number;
  productDetailId?: string;
  quantity?: number;
  productCode?: string | null;
  referenceKey?: string | null;
  customId?: object;

  constructor(data: Partial<ICart>) {
    this.customId = {
      mongoId: data._id,
      cartId: data.cartId,
    };
    this.userId = data.userId || "";
    this.tenantId = data.tenantId || undefined;
    this.productDetailId = data.productDetailId || "";
    this.quantity = data.quantity || 0;
    this.productCode = data.productCode || null;
    this.referenceKey = data.referenceKey || null;
  }
}
