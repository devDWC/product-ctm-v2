//src/services/mgo-services/product-service/admin/product.admin.service.ts
import { t } from "../../../../locales";

import { ProductRepository } from "../../../../repository/mgo-repository/product-repository/product.repository";
import { ProductExtension } from "../../../../shared/functions/product-extensions";
import { S3Service } from "../../../helper-services/s3.service";
import { v4 as uuidv4 } from "uuid";
import { CategoryService } from "../../categories-service/admin/category.admin.service";
import { createSlug } from "../../../helper-services/sp-service";
import { ProductDetailCreateDto } from "../../../../model/dto/product-detail/product-detail.dto";
import unitOfWork from "../../../../shared/utils/unitOfWork";
import { ProductDetailsModel } from "../../../../model/entities/product-detail.entities";

export class ProductService {
  private productRepo: ProductRepository;
  private readonly _s3Service = new S3Service();
  private readonly _productExtension = new ProductExtension();
  private readonly categoriesService = new CategoryService();

  constructor() {
    this.productRepo = new ProductRepository();
  }

  // Hàm chính khởi tạo sản phẩm chi tiết
  public async createProductDetails(productListData : any) {
    // Tạo danh sách input model thuần (chưa gọi new ProductDetailsModel)
    const inputList = productListData.map((productData: any) => {
      const productCode = `B${productData.tenantId}-${productData.productCode}`;
      const slug = createSlug(
        `${productData.name_product_details}-${productData.title_product_details}`
      );

      // const inputCreate = autoMapUntility.autoMapWithClass(
      //   productData,
      //   ProductDtCreateDto
      // );
      const inputCreate = new ProductDetailCreateDto(productData);
      return {
        ...inputCreate,
        productDetailId: uuidv4(),
        productCode,
        slug_product_details: slug,
      };
    });

    // Gọi insertMany 1 lần để lưu danh sách này
    return unitOfWork.runInTransaction(async (session: any) => {
      const createdDocs = await ProductDetailsModel.insertMany(inputList, {
        session,
      });
      return createdDocs;
    });
  }
}
