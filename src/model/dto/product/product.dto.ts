import { IProduct } from "../../entities/product.entities";

export class ProductDto {
  customId: object;
  productCode: string;
  name: string;
  title: string;
  slug: string;
  meta_slug: string;
  productType: string;
  description: string;
  short_description: string;
  image_url: string;
  gallery_product: string;
  price: number;
  product_extend: string;
  unit: string;
  availability: boolean;
  rating: number;
  review_count: number;
  meta_title: string;
  meta_keywords: string;
  meta_description: string;
  affiliateLinks: string;
  status: string;
  categoryId: string;
  referenceKey: string;
  userUpdate?: string;
  userCreate?: string;
  isDeleted: boolean;
  createDate?: Date;
  updateDate?: Date;

  constructor(data: Partial<IProduct>) {
    this.customId = {
      mongoId: data?._id,
      productId: data?.productId,
    };
    this.productCode = data?.productCode ?? "";
    this.name = data?.name ?? "";
    this.title = data?.title ?? "";
    this.slug = data?.slug ?? "";
    this.meta_slug = data?.meta_slug ?? "";
    this.productType = data?.productType ?? "product-source";
    this.description = data?.description ?? "";
    this.short_description = data?.short_description ?? "";
    this.image_url = data?.image_url ?? "";
    this.gallery_product = data?.gallery_product ?? "";
    this.price = data?.price ?? 0;
    this.product_extend = data?.product_extend ?? "";
    this.unit = data?.unit ?? "";
    this.availability = data?.availability ?? false;
    this.rating = data?.rating ?? 0;
    this.review_count = data?.review_count ?? 0;
    this.meta_title = data?.meta_title ?? "";
    this.meta_keywords = data?.meta_keywords ?? "";
    this.meta_description = data?.meta_description ?? "";
    this.affiliateLinks = data?.affiliateLinks ?? "";
    this.status = data?.status ?? "";
    this.categoryId = data?.categoryId ?? "";
    this.referenceKey = data?.referenceKey ?? "";
    this.userUpdate = data?.userUpdate;
    this.userCreate = data?.userCreate;
    this.isDeleted = data?.isDeleted ?? false;
    this.createDate = data?.createDate;
    this.updateDate = data?.updateDate;
  }
}
