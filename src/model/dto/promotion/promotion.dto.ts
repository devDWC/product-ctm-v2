import { IPromotion } from "../../entities/promotion.entities";

export class CreatePromotionDto {
  name?: string;
  description?: string;
  type?: string;
  banner_img?: string;
  logo_img?: string;
  color_code?: string;
  start_time?: Date;
  end_time?: Date;
  tenantId?: number;
  is_recurring?: string;
  recurring_config?: string;
  status?: boolean;
  userUpdate?: string;
  codeName?: string;
  index?: number;
  background_color_promotion_code?: string;
  background_color_code?: string;
  value1?: string;
  value2?: string;
  value3?: string;
  number1?: number;
  number2?: number;
  number3?: number;
  bool1?: boolean;
  bool2?: boolean;
  bool3?: boolean;
  limit_items?: number;
}

export class PromotionDto {
  customId: {
    mongoId?: any;
    promotionId?: string;
  };

  name: string;
  description: string;
  type: string;
  banner_img: string;
  logo_img: string;
  color_code: string;
  start_time: Date | string | null;
  end_time: Date | string | null;
  tenantId: number;
  is_recurring: string;
  recurring_config: string;
  index: number | string;
  icon_img: string;
  background_color_code: string;
  background_color_promotion_code: string;
  status: boolean | string;
  limit_items: number | null;
  userUpdate: string;
  codeName?: string;
  value1: string | null;
  value2: string | null;
  value3: string | null;
  number1: number;
  number2: number;
  number3: number;
  bool1: boolean;
  bool2: boolean;
  bool3: boolean;
  isDeleted: boolean;
  createDate: Date | string | null;
  updateDate: Date | string | null;

  constructor(data: Partial<IPromotion> = {}) {
    this.customId = {
      mongoId: data._id,
      promotionId: data.promotionId,
    };

    this.name = data.name || "";
    this.description = data.description || "";
    this.type = data.type || "";
    this.banner_img = data.banner_img || "";
    this.logo_img = data.logo_img || "";
    this.color_code = data.color_code || "";
    this.start_time = data.start_time || null;
    this.end_time = data.end_time || null;
    this.tenantId = data.tenantId || 0;
    this.is_recurring = data.is_recurring || "";
    this.recurring_config = data.recurring_config || "";
    this.index = data.index || "";
    this.icon_img = data.icon_img || "";
    this.background_color_code = data.background_color_code || "";
    this.background_color_promotion_code =
      data.background_color_promotion_code || "";
    this.status = data.status || "";
    this.limit_items = data.limit_items || null;
    this.userUpdate = data.userUpdate || "";
    this.codeName = data.codeName;
    this.value1 = data.value1 || null;
    this.value2 = data.value2 || null;
    this.value3 = data.value3 || null;
    this.number1 = data.number1 || 0;
    this.number2 = data.number2 || 0;
    this.number3 = data.number3 || 0;
    this.bool1 = data.bool1 ?? false;
    this.bool2 = data.bool2 ?? false;
    this.bool3 = data.bool3 ?? false;
    this.isDeleted = data.isDeleted ?? false;
    this.createDate = data.createDate || null;
    this.updateDate = data.updateDate || null;
  }
}


