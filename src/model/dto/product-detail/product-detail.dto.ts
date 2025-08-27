export interface IProductDetailCreateDto {
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