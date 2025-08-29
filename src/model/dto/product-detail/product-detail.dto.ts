import { getUrlImgProduct } from "../../../shared/utils/img-untity";

/**
 * DTO tạo ProductDetail
 */
export interface IProductDetailCreateDto {
  /**
   * Tên sản phẩm
   * @example "Sản phẩm A"
   */
  name_product_details?: string;

  /**
   * Tiêu đề
   * @example "Tiêu đề sản phẩm A"
   */
  title_product_details?: string;

  /**
   * Giá gốc
   * @example 100000
   */
  price_product_details?: number;

  /**
   * Giá sale
   * @example 80000
   */
  price_sale_product_details?: number;

  /**
   * Slug
   * @example "san-pham-a"
   */
  slug_product_details?: string;

  /**
   * % giảm giá
   * @example 20
   */
  sale_product_details?: number;

  /**
   * Tenant ID
   * @example 3
   */
  tenantId?: number;

  /**
   * Rating
   * @example 4.5
   */
  rating_product_details?: number;

  /**
   * Có hiển thị không
   * @example 1
   */
  isShow?: number;

  /**
   * Đơn vị
   * @example "cái"
   */
  unit?: string;

  /**
   * Mô tả thêm
   * @example "Mô tả thêm cho sản phẩm A"
   */
  product_extend?: string;

  /**
   * Số lượng còn
   * @example 50
   */
  amount_available?: number;

  /**
   * ID sản phẩm gốc
   * @example "c885c4b1-feab-408f-bdcd-98afe172dadc"
   */
  productId?: string;

  /**
   * ID category
   * @example "d33e2af5-a8e0-4802-b8b0-3ab3d1e7bc92"
   */
  categoryId?: string;

  /**
   * Mã sản phẩm
   * @example "P000207"
   */
  productCode?: string;

  /**
   * Loại sản phẩm
   * @example "product-source"
   */
  productType?: string;

  /**
   * Reference Key
   * @example "98b6b1f8-95c6-4f9f-8172-a415e89a4185"
   */
  referenceKey?: string;

  /**
   * Spotlight titles
   * @example ["title1", "title2"]
   */
  spotlight_title_ids?: string[];

  /**
   * Mô tả ngắn
   * @example "Sản phẩm A siêu hot"
   */
  short_description?: string;

  /**
   * product detail id
   * @example "8e8f1018-a792-4c9b-9437-d7d1c8d7f0bb"
   */
  productDetailId?: string;
}


export class ProductDetailCreateDto implements IProductDetailCreateDto {
  name_product_details?: string;
  title_product_details?: string;
  price_product_details?: number;
  price_sale_product_details?: number;
  slug_product_details?: string;
  sale_product_details?: number;
  tenantId?: number;
  rating_product_details?: number;
  isShow?: number;
  unit?: string;
  product_extend?: string;
  amount_available?: number;
  productId?: string;
  categoryId?: string;
  productCode?: string;
  productType?: string;
  referenceKey?: string;
  spotlight_title_ids?: string[];
  short_description?: string;
  productDetailID?: string;

  constructor(data: Partial<IProductDetailCreateDto> = {}) {
    Object.assign(this, data);

    if (
      this.sale_product_details === 0 ||
      this.price_sale_product_details === 0
    ) {
      this.price_sale_product_details = this.price_product_details;
    }
  }
}

export class ProductDtExtendV1Dto {
  productDetailId: string | null;
  productCode: string | null;
  image_url: string | null;
  title: string;
  slug: string;
  unit: string | null;
  price: number;
  priceSale: number;
  color: string;
  sale: number;
  short_description: string;
  productType: string | null;
  keyPromotion: string | null;
  quantity_promotion: number | null;
  promotion_id: string | null;
  namePromotion: string | null;

  constructor() {
    this.productDetailId = null;
    this.productCode = null;
    this.image_url = null;
    this.title = "";
    this.slug = "";
    this.unit = null;
    this.price = 0;
    this.priceSale = 0;
    this.color = "";
    this.sale = 0;
    this.short_description = "";
    this.productType = null;
    this.keyPromotion = null;
    this.quantity_promotion = null;
    this.promotion_id = null;
    this.namePromotion = null;
  }

  /**
   * Factory method to map from ProductDetails (plain object)
   * @param dto ProductDetails object
   * @returns ProductDtExtendV1Dto
   */
  static init(dto: Partial<any>): ProductDtExtendV1Dto {
    const extend = new ProductDtExtendV1Dto();
    extend.productDetailId = dto.productDetailId ?? null;
    extend.productCode = dto.productCode ?? null;
    extend.title = dto.title_product_details ?? dto.name_product_details ?? "";
    extend.slug = dto.slug_product_details ?? "";
    extend.unit = dto.unit ?? null;
    extend.price = Number(dto.price_product_details) || 0;
    extend.priceSale = Number(dto.price_sale_product_details) || 0;
    extend.sale = Number(dto.sale_product_details) || 0;
    extend.short_description = dto.short_description ?? "";
    extend.keyPromotion = dto.keyPromotion ?? null;
    extend.quantity_promotion = dto.quantity_promotion ?? null;
    extend.promotion_id = dto.promotion_id ?? null;
    extend.namePromotion = dto.namePromotion ?? null;
    extend.productType = dto.productType ?? null;
    return extend;
  }
}

export class ProductDtUpdateDto {
  name_product_details: string = "";
  title_product_details: string = "";
  price_product_details: number = 0;
  price_sale_product_details: number = 0;
  slug_product_details: string = "";
  sale_product_details: boolean = false;
  rating_product_details: number = 0;
  isShow: boolean = false;
  unit: string = "";
  product_extend: any = null;
  amount_available: number = 0;
  productId: string = "";
  categoryId: string = "";
  short_description: string = "";
}

export class ProductDetailDto {
  id: string;
  productCode: string;
  title_product_details: string;
  name_product_details: string;
  slug_product_details: string;
  gallery_product: string[];
  category: { id: string; name: string; slug: string } | null;
  price_product_details: number;
  price_sale_product_details: number;
  unit: string;
  amount_available: number;
  isShow: boolean;
  expiration_date_product_details?: Date;
  keyPromotion?: string;
  qualityPromotion?: number;
  updateDate?: Date;
  sale_promotion?: number;
  product_promotion_id?: string;

  constructor(x: any, baseUrl: string) {
    let gallery = Array.isArray(x.product?.gallery_product)
      ? x.product.gallery_product
      : JSON.parse(x.product?.gallery_product || "[]");

    this.gallery_product = gallery.map((g: any) =>
      getUrlImgProduct(baseUrl, x.product?.productCode, g)
    );

    this.id = x.id;
    this.productCode = x.productCode;
    this.title_product_details = x.title_product_details;
    this.name_product_details = x.name_product_details;
    this.slug_product_details = x.slug_product_details;
    this.category = x.category
      ? {
          id: x.category.id,
          name: x.category.name,
          slug: x.category.slug,
        }
      : null;
    this.price_product_details = x.price_product_details;
    this.price_sale_product_details = x.price_sale_product_details;
    this.unit = x.unit;
    this.amount_available = x.amount_available;
    this.isShow = x.isShow;
    this.expiration_date_product_details = x.expiration_date_product_details;
    this.keyPromotion = x.key;
    this.qualityPromotion = x.quantity_promotion;
    this.updateDate = x.updateDate;
    this.sale_promotion = x.sale_product_details;
    this.product_promotion_id = x.product_promotion_id;
  }

  static fromList(list: any[], baseUrl: string): ProductDetailDto[] {
    return list.map((x) => new ProductDetailDto(x, baseUrl));
  }
}
