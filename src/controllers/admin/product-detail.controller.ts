import { ApiResponse } from "./../../model/base/response.dto";
import {
  Controller,
  Route,
  Tags,
  Post,
  Body,
  Query,
  Header,
  Get,
  Security,
  Middlewares,
  Path,
  Delete,
  Put,
  Example,
} from "tsoa";

import { t } from "../../locales";
import {
  ExceptionError,
  NotfoundError,
  Success,
} from "../../shared/utils/response.utility";
import { ProductDetailService } from "../../services/mgo-services/product-detail-service/admin/product-detail.admin.service";
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import {
  InputQuery,
  InputQueryCleaner,
} from "../../model/base/input-query.dto";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { IProductDetailCreateDto } from "../../model/dto/product-detail/product-detail.dto";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import { createProductDetailSchema } from "../../shared/validators/product-detail.validator";
import z from "zod";

@Tags("ProductDetail")
@Route("/v1/admin/product-detail")
export class ProductDetailController extends Controller {
  private readonly productDetailService = new ProductDetailService();
  private PRODUCT_DETAIL_NAME = "ProductDetail";

  /**
   * @summary Danh sách sản phẩm detail
   */
  @Get("/")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("productDetail", "get")])
  public async getProductDetails(
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

      const { listData, total } =
        await this.productDetailService.getProductDetails(
          InputQueryCleaner.clean(option)
        );
      _logSingletonService.info(
        t(lang, "getAllSuccess", "productDetail"),
        listData
      );
      return Success(
        listData,
        t(lang, "getAllSuccess", "productDetail"),
        total
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "getAllFailure", "productDetail")
      );
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "productDetail")
      );
    }
  }

  /**
   * @summary Danh sách sản phẩm detail
   */
  @Get("/{productDetailId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("productDetail", "get")])
  public async getProductDetailById(
    @Path() productDetailId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = await this.productDetailService.getProductDetailById(
        productDetailId
      );
      if (!result) {
        _logSingletonService.error(
          t(lang, "notFound", "productDetail"),
          result
        );
        return NotfoundError(t(lang, "notFound", "productDetail"));
      }
      _logSingletonService.info(
        t(lang, "getAllSuccess", "productDetail"),
        result
      );
      return Success(result, t(lang, "getAllSuccess", "productDetail"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "getAllFailure", "productDetail")
      );
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "productDetail")
      );
    }
  }

  /**
   * @summary Danh sách sản phẩm có promotion bên trong CMS
   */
  @Get("/getProductDetailsCMSWithPromotion/data")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("productDetail", "get")])
  public async getProductDetailsCMSWithPromotion(
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

      const { listData, total } =
        await this.productDetailService.getProductDetailsWithPromotion(
          InputQueryCleaner.clean(option)
        );
      _logSingletonService.info(
        t(lang, "getAllSuccess", "productDetail"),
        listData
      );
      return Success(
        listData,
        t(lang, "getAllSuccess", "productDetail"),
        total
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "getAllFailure", "productDetail")
      );
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "productDetail")
      );
    }
  }

  /**
   * @summary Lấy thống kê theo sản phẩm
   */
  @Get("/getRevenueStatistic/getData/data")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("productDetail", "get")])
  public async getRevenueStatistic(
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

      const { totalRevenue, growthPercent, yearlyIncrease } =
        await this.productDetailService.getRevenueProductVsStatistic(
          InputQueryCleaner.clean(option)
        );

      _logSingletonService.info(t(lang, "getAllSuccess", "productDetail"), {
        data: { totalRevenue, growthPercent, yearlyIncrease },
      });
      return Success(
        { totalRevenue, growthPercent, yearlyIncrease },
        t(lang, "getAllSuccess", "productDetail")
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "getAllFailure", "productDetail")
      );
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "productDetail")
      );
    }
  }

  /**
   * @summary Tạo mới một product detail
   */
  @Post("/")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("productDetail", "create")])
  public async createProductDetail(
    @Body() dto: IProductDetailCreateDto[],
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = validateAndSanitize(
        z.array(createProductDetailSchema),
        dto,
        lang
      );
      if (result.error) {
        _logSingletonService.businessErrorLog(
          this.PRODUCT_DETAIL_NAME,
          result.error.message,
          result.error.message
        );
        return result.error;
      }

      const response = await this.productDetailService.createProductDetails(
        result.data
      );

      if ("status" in response) {
        _logSingletonService.businessErrorLog(
          this.PRODUCT_DETAIL_NAME,
          response.message,
          t(lang, "createFailed", "productDetail")
        );
        return response;
      }

      _logSingletonService.info(
        t(lang, "createSuccess", "productDetail"),
        t(lang, "createSuccess", "productDetail")
      );
      return Success(
        response,
        t(lang, "createSuccess", "productDetail"),
        result.data.length
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "createFailed", "productDetail")
      );
      return ExceptionError(t(lang, "createFailed", "productDetail"));
    }
  }

  /**
   * @summary Cập nhật product detail
   */
  @Put("/{productDetailId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("productDetail", "update")])
  public async updateProductDetail(
    @Body() dto: IProductDetailCreateDto[],
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = validateAndSanitize(
        z.array(createProductDetailSchema),
        dto,
        lang
      );
      if (result.error) {
        _logSingletonService.businessErrorLog(
          this.PRODUCT_DETAIL_NAME,
          result.error.message,
          t(lang, "updateFailed", "productDetail")
        );
        return result.error;
      }

      const response = await this.productDetailService.updateProductDetails(
        result.data
      );

      if (response.status === 409) {
        _logSingletonService.businessErrorLog(
          this.PRODUCT_DETAIL_NAME,
          response.message,
          t(lang, "updateFailed", "productDetail")
        );
        return response;
      }
      _logSingletonService.info(
        t(lang, "updateSuccess", "productDetail"),
        response
      );
      return Success(
        response,
        t(lang, "updateSuccess", "productDetail"),
        result.data.length
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "updateFailed", "productDetail")
      );
      return ExceptionError(t(lang, "updateFailed", "productDetail"));
    }
  }

  /**
   * @summary Xóa một productDetail theo productDetailId.
   */
  @Delete("/{productDetailId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("productDetail", "delete")])
  public async deleteHardProduct(
    @Path() productDetailId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = await this.productDetailService.deleteProductDetail(
        productDetailId,
        undefined
      );

      if (!result) {
        _logSingletonService.businessErrorLog(
          this.PRODUCT_DETAIL_NAME,
          t(lang, "notFound", "productDetail"),
          t(lang, "deleteFailure", "productDetail")
        );
        return NotfoundError(t(lang, "notFound", "productDetail"));
      }

      _logSingletonService.info(t(lang, "deleteSuccess", "product"), result);
      return Success(result, t(lang, "deleteSuccess", "product"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "deleteFailure", "productDetail")
      );
      return ExceptionError(t(lang, "deleteFailure", "product"));
    }
  }

  /**
   * @summary Xóa mềm một productDetail theo productDetailId.
   */
  @Put("/temp/{productDetailId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "delete")])
  public async deleteSoftProduct(
    @Path() productDetailId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result =
        await this.productDetailService.deleteProductDetailTemporary(
          productDetailId,
          lang
        );
      if (!result) {
        _logSingletonService.businessErrorLog(
          this.PRODUCT_DETAIL_NAME,
          t(lang, "notFound", "productDetail"),
          t(lang, "notFound", "productDetail")
        );
        return NotfoundError(t(lang, "notFound", "productDetail"));
      }

      _logSingletonService.info(
        t(lang, "deleteSuccess", "productDetail"),
        result
      );
      return Success(result, t(lang, "deleteSuccess", "productDetail"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "notFound", "productDetail")
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "product")
      );
    }
  }

  /**
   * @summary Cập nhật thời gian của productDt
   */
  @Put("/updateProductDetailTime/{productDetailId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("product", "delete")])
  public async updateProductDetailTime(
    @Path() productDetailId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const { data, success } =
        await this.productDetailService.updateProductDetailTime(
          productDetailId,
          lang
        );
      if (success) {
        _logSingletonService.businessErrorLog(
          this.PRODUCT_DETAIL_NAME,
          data.message,
          t(lang, "notFound", "productDetail")
        );
        return data;
      }

      _logSingletonService.info(
        t(lang, "updateSuccess", "productDetail"),
        data.message
      );
      return data;
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PRODUCT_DETAIL_NAME,
        error.message,
        t(lang, "updateFailure", "productDetail")
      );
      return ExceptionError(
        error?.message || t(lang, "updateFailure", "productDetail")
      );
    }
  }
}
