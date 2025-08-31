import { IPromotionUserLimit } from "../../entities/promotion-user-limit";

export class CreatePromotionUserLimitDto {
  /**
   * id khuyến mãi
   * @example "85329595-9f69-4100-a271-c61fbf7b483d"
   */
  promotionId?: string;

  /**
   * số điện thoại người dùng
   * @example "123456789"
   */
  phone?: string;

  /**
   * số lần giới hạn
   * @example 5
   */
  amount: number = 0;
}

export class PromotionUserLimitDto {
  promotionId?: string;
  amount?: number;
  phone?: string;
  customId?: object;

  constructor(data: Partial<IPromotionUserLimit>) {
    this.customId = {
      mongoId: data._id,
      promotionUserLimitId: data.promotionUserLimitId,
    };
    this.promotionId = data.promotionId || "";
    this.amount = data.amount ?? 0;
    this.phone = data.phone ?? "";
  }
}

export class VerifyPromotionProductDto {
  /**
   * id khuyến mãi
   * @example "8c1f4bb4-2b7a-4b2b-8d2d-123456789abc"
   */
  promotionId!: string;

  /**
   * id product promotion
   * @example "4e5d6f7a-1b2c-4d5e-9f8a-abcdef123456"
   */
  productPromotionId!: string;

  /**
   * số lượng mua
   * @example 3
   */
  amount!: number;
}

export class VerifyPromotionDto {
  /**
   * số điện thoại người dùng
   * @example "84901234567"
   */
  phone!: string;

  /**
   * Danh sách product trong promotion
   * @example [
   *     {
   *       "promotionId": "090cff41-21ec-4a86-a789-44862ab1bc2a",
   *       "amount": 2,
   *       "productPromotionId": "06fa7fa8-2bc9-44b8-a02f-ee9f7a31a45b",
   *     },{
   *       "promotionId": "090cff41-21ec-4a86-a789-44862ab1bc2a",
   *       "amount": 2,
   *       "productPromotionId": "6a53f4db-c6c3-4d35-bc7a-a3cdca11669c",
   *     }
   *   ]
   */
  productDt!: VerifyPromotionProductDto[];
}
