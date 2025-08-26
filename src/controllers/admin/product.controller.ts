import {
  Controller,
  Route,
  Tags,
  Query,
  Header,
  Get,
  Path,
  Post,
  Security,
  Middlewares,
  FormField,
  UploadedFiles,
  Put,
  Delete,
} from "tsoa";

import { t } from "../../locales";
import {
  ExceptionError,
  NotfoundError,
  ProcessError,
  Success,
} from "../../shared/utils/response.utility";
import { S3Service } from "../../services/helper-services/s3.service";
import { ApiResponse } from "../../model/base/response.dto";
import { InputQuery } from "../../model/base/input-query.dto";
import { ProductService } from "../../services/mgo-services/product-service/admin/product.admin.service";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import {
  createProductSchema,
  updateProductSchema,
} from "../../shared/validators/product.validator";
import {
  CreateProductDto,
  UpdateProductDto,
} from "../../model/dto/product/product.dto";

@Tags("Product")
@Route("/v1/admin/product")
export class ProductController extends Controller {
  private readonly _s3Service = new S3Service();
  private readonly productService = new ProductService();

  /**
   * @summary Lấy danh sách sản phẩm có pagination và search.
   */
  @Get("/")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "get")])
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

      const { data, total } = await this.productService.getAllProducts(option);
      _logSingletonService.info(t(lang, "getAllSuccess", "product"), data);
      return Success(data, t(lang, "getAllSuccess", "product"), total);
    } catch (error: any) {
      _logSingletonService.error(t(lang, "getAllFailure", "product"), error);
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "product")
      );
    }
  }

  /**
   * @summary Lấy sản phẩm theo productId.
   */
  @Get("/{productId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "get")])
  public async getCategoryById(
    @Path() productId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.productService.getProductById(productId);
      if (!category) {
        _logSingletonService.error(t(lang, "notFound", "product"), category);
        return NotfoundError(t(lang, "notFound", "product"));
      }
      _logSingletonService.info(t(lang, "getOneSuccess", "product"), category);
      return Success(category, t(lang, "getOneSuccess", "product"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "getOneFailure", "product"), error);
      return ExceptionError(
        error?.message || t(lang, "getOneFailure", "product")
      );
    }
  }

  /**
   * @summary Lấy sản phẩm theo productId.
   */
  @Get("/categoryId/{categoryId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "get")])

  public async getProductByCategoryId(
    @Path() categoryId: string,
    @Query() pageCurrent: number = 1,
    @Query() pageSize: number = 10,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const product = await this.productService.getProductsByCategoryId(
        categoryId,
        pageCurrent,
        pageSize
      );
      if (!product) {
        _logSingletonService.error(t(lang, "notFound", "product"), product);
        return NotfoundError(t(lang, "notFound", "product"));
      }
      _logSingletonService.info(t(lang, "getOneSuccess", "product"), product);
      return Success(product, t(lang, "getOneSuccess", "product"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "getAllFailure", "product"), error);
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "product")
      );
    }
  }

  /**
   * @summary Tạo mới một sản phẩm
   */
  @Post("/")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "create")])
  public async createProduct(
    @FormField() name: string,
    @FormField() title: string,
    @FormField() slug: string,
    @FormField() categoryId: string,
    @FormField() price: number,

    @FormField() description?: string,
    @FormField() short_description?: string,
    @FormField() product_extend?: string,
    @FormField() unit?: string,
    @FormField() productType?: string,
    @FormField() referenceKey?: string,

    @FormField() meta_title?: string,
    @FormField() meta_keywords?: string,
    @FormField() meta_description?: string,
    @FormField() affiliateLinks?: string,
    @FormField() status?: string,

    @FormField() availability?: boolean,
    @FormField() review_count?: number,
    @FormField() rating?: number,

    @FormField() userUpdate?: string,
    @FormField() userCreate?: string,

    @UploadedFiles() gallery_product?: Express.Multer.File[],
    @UploadedFiles() gallery_productExtend?: Express.Multer.File[],

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const dto: CreateProductDto = {
        name,
        title,
        slug,
        categoryId,
        price,
        description,
        short_description,
        product_extend,
        unit,
        productType,
        meta_title,
        meta_keywords,
        meta_description,
        affiliateLinks,
        status,
        availability,
        review_count,
        rating,
        referenceKey,
        userUpdate,
        userCreate,
        gallery_product,
        gallery_productExtend,
      };

      const result = validateAndSanitize(createProductSchema, dto, lang);
      if (result.error) {
        _logSingletonService.error(result.error.message, result.error);
        return result.error;
      }

      const product = await this.productService.createProduct(dto);

      _logSingletonService.info(t(lang, "createSuccess", "product"), product);
      return Success(
        product,
        t(lang, "createSuccess", "product"),
        product.length
      );
    } catch (error: any) {
      _logSingletonService.error(t(lang, "createFailed", "product"), error);
      return ExceptionError(t(lang, "createFailed", "product"));
    }
  }

  /**
   * @summary Cập nhật một sản phẩm theo productId
   */
  @Put("/{productId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "update")])
  public async updateProduct(
    @Path() productId: string,

    @FormField() name: string,
    @FormField() title: string,
    @FormField() slug: string,
    @FormField() categoryId: string,
    @FormField() price: number,

    @FormField() description?: string,
    @FormField() short_description?: string,
    @FormField() product_extend?: string,
    @FormField() unit?: string,
    @FormField() productType?: string,
    @FormField() referenceKey?: string,

    @FormField() meta_title?: string,
    @FormField() meta_keywords?: string,
    @FormField() meta_description?: string,
    @FormField() affiliateLinks?: string,
    @FormField() status?: string,

    @FormField() availability?: boolean,
    @FormField() review_count?: number,
    @FormField() rating?: number,

    @FormField() userUpdate?: string,
    @FormField() userCreate?: string,
    @FormField() isDeleted?: boolean,
    @UploadedFiles() gallery_product?: Express.Multer.File[],
    @UploadedFiles() gallery_productExtend?: Express.Multer.File[],

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const dto: UpdateProductDto = {
        name,
        title,
        slug,
        categoryId,
        price,
        description,
        short_description,
        product_extend,
        unit,
        productType,
        meta_title,
        meta_keywords,
        meta_description,
        affiliateLinks,
        status,
        availability,
        review_count,
        rating,
        referenceKey,
        userUpdate,
        isDeleted,
        userCreate,
        gallery_product,
        gallery_productExtend,
      };

      const result = validateAndSanitize(updateProductSchema, dto, lang);
      if (result.error) {
        _logSingletonService.error(result.error.message, result.error);
        return result.error;
      }

      const product = await this.productService.updateProduct(productId, dto);

      _logSingletonService.info(t(lang, "updateSuccess", "product"), product);
      return Success(product, t(lang, "updateSuccess", "product"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "updateFailed", "product"), error);
      return ExceptionError(t(lang, "updateSuccess", "product"));
    }
  }

  /**
   * @summary Cập nhật trạng thái của sản phẩm theo productId
   */
  @Put("/status/{productId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "update")])
  public async updateProductStatus(
    @Path() productId: string,
    @Query() status?: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = await this.productService.updateStatus(
        productId,
        status || "",
        lang
      );
      if (result.success) {
        _logSingletonService.info(result.message, result);
        return Success(result, result.message);
      } else {
        _logSingletonService.error(result.message, result?.error);
        return ProcessError(result.message);
      }
    } catch (error: any) {
      _logSingletonService.error(t(lang, "updateFailed", "product"), error);
      return ExceptionError(t(lang, "updateSuccess", "product"));
    }
  }

  /**
   * @summary Xóa cứng một sản phẩm theo productId.
   */
  @Delete("/{productId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "delete")])
  public async deleteHardProduct(
    @Path() productId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = await this.productService.deleteHardProduct(
        productId,
        undefined,
        lang
      );
      if (!result.status) {
        _logSingletonService.error(result.message, result);
        return NotfoundError(result.message);
      }

      _logSingletonService.info(t(lang, "deleteSuccess", "product"), result);
      return Success(result.productUpdate, t(lang, "deleteSuccess", "product"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "deleteFailure", "product"), error);
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "product")
      );
    }
  }

  /**
   * @summary Xóa mềm một sản phẩm theo productId.
   */
  @Put("/temp/{productId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "delete")])
  public async deleteSoftProduct(
    @Path() productId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.productService.deleteSoftProduct(
        productId,
        undefined,
        lang
      );
      if (!category) {
        _logSingletonService.error(t(lang, "notFound", "product"), category);
        return NotfoundError(t(lang, "notFound", "product"));
      }

      _logSingletonService.info(t(lang, "deleteSuccess", "product"), category);
      return Success(category, t(lang, "deleteSuccess", "product"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "deleteFailure", "product"), error);
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "product")
      );
    }
  }
}
