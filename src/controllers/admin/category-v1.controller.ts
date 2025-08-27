// src/controllers/public/category.controller.ts
import { Controller, Route, Tags, Header, Get, Path, Query } from "tsoa";

import { t } from "../../locales";
import { S3Service } from "../../services/helper-services/s3.service";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { CategoryService } from "../../services/mgo-services/categories-service/admin/category-v1.admin.service";
import { ApiResponse } from "../../model/base/response.dto";
import { ExceptionError, Success } from "../../shared/utils/response.utility";

@Tags("CategoryV1")
@Route("/v1/public/categories")
export class CategoryV1Controller extends Controller {
  private categoryService = new CategoryService();
  private readonly _s3Service = new S3Service();

  /**
   * @summary Lấy sản phẩm theo category con và tổng hợp thành list lớn
   */
  @Get("/getProductData")
  public async getProductData(
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const categories =
        await this.categoryService.getListProductsWithCategory();
      _logSingletonService.info(
        t(lang, "getChildrenSuccess", "categories"),
        categories
      );
      return Success(categories, t(lang, "getChildrenSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(error.message, error);
      return ExceptionError(error?.message || error.message);
    }
  }

  /**
   * @summary lấy danh sách cateogory và category con theo cấp
   */
  @Get("/getCategoryData")
  public async getCategoryData(
    @Query() tenantId?: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const categories = await this.categoryService.getListCategory(tenantId);
      _logSingletonService.info(
        t(lang, "getChildrenSuccess", "categories"),
        categories
      );
      return Success(categories, t(lang, "getChildrenSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(error.message, error);
      return ExceptionError(error?.message || error.message);
    }
  }

  /**
   * @summary lấy danh sách cateogory và category con theo slug
   */
  @Get("/getCategoryBySlug")
  public async getCategoryBySlug(
    @Query() slug: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const categories = await this.categoryService.getCategoryBySlug(
        slug,
        lang
      );
      _logSingletonService.info(
        t(lang, "getChildrenSuccess", "categories"),
        categories
      );
      return Success(categories, t(lang, "getChildrenSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(error.message, error);
      return ExceptionError(error?.message || error.message);
    }
  }

  /**
   * @summary lấy danh sách cateogory theo id
   */
  @Get("/getCategoryTreeById")
  public async getCategoryTreeById(
    @Query() categoryId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const categories = await this.categoryService.getCategoryTreeById(
        categoryId,
        lang
      );
      _logSingletonService.info(
        t(lang, "getChildrenSuccess", "categories"),
        categories
      );
      return Success(categories, t(lang, "getChildrenSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(error.message, error);
      return ExceptionError(error?.message || error.message);
    }
  }
}
