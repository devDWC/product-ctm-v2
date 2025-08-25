import {
  Controller,
  Route,
  Tags,
  Query,
  Header,
  Get,
  Path,
} from "tsoa";

import { t } from "../../locales";
import { ExceptionError, NotfoundError, Success } from "../../shared/utils/response.utility";
import { S3Service } from "../../services/helper-services/s3.service";
import { ApiResponse } from "../../model/base/response.dto";
import { InputQuery } from "../../model/base/input-query.dto";
import { ProductService } from "../../services/mgo-services/product-service/admin/product.admin.service";

@Tags("Product")
@Route("/v1/admin/product")
export class ProductController extends Controller {
  private readonly _s3Service = new S3Service();
  private readonly productService = new ProductService();
    @Get("/")
    public async getAllProduct(
      @Query() search?: string,
      @Query() pageCurrent: number = 1,
      @Query() pageSize: number = 10,
      @Query() sortList?: string,
      @Query() conditions?: string,
      @Header("X-Language") lang?: string
    ): Promise<ApiResponse> {
      try {
        const option: InputQuery = {
          search,
          pageCurrent,
          pageSize,
          sortList: sortList ? JSON.parse(sortList) : [],
          conditions: conditions ? JSON.parse(conditions) : [],
        };
  
        const { data, total } = await this.productService.getAllProducts(
          option
        );
        return Success(data, t(lang, "getAllSuccess", "product"), total);
      } catch (error: any) {
        return ExceptionError(
          error?.message || t(lang, "getAllFailure", "product")
        );
      }
    }
  
    @Get("/{productId}")
    public async getCategoryById(
      @Path() productId: string,
      @Header("X-Language") lang?: string
    ): Promise<ApiResponse> {
      try {
        const category = await this.productService.getProductById(productId);
        if (!category) return NotfoundError(t(lang, "notFound", "product"));
        return Success(category, t(lang, "getOneSuccess", "product"));
      } catch (error: any) {
        return ExceptionError(
          error?.message || t(lang, "getOneFailure", "product")
        );
      }
    }
}
