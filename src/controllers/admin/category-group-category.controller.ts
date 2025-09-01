// src/controllers/admin/category-group-category.controller.ts
import {
  Controller,
  Post,
  Delete,
  Route,
  Tags,
  Middlewares,
  Header,
  Security,
  Get,
  Query,
  Body,
} from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import { Success, ExceptionError } from "../../shared/utils/response.utility";
import { CategoryGrCategoryService } from "../../services/mgo-services/categories-group-category-service/admin/categories-group-category.admin.service";
import {
  InputQuery,
  InputQueryCleaner,
} from "../../model/base/input-query.dto";
import { OutputCategoryGroupDto } from "../../model/dto/categoryGroup/categoryGroup.dto";
import { t } from "../../locales";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import { InputCategoryGroupCategoryDto } from "../../model/dto/categoryGroupCategory/categoryGroupCategory.dto";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import { createCategoryGroupCategorySchema } from "../../shared/validators/categoryGroupCategory.validator";

@Tags("CategoryGroupCategory")
@Route("/v1/admin/category-group-category")
export class CategoryGroupCategoryController extends Controller {
  private categoryGrCategoryService = new CategoryGrCategoryService();
  private CATEGORY_GROUP_CATEGORY_NAME = "CategoryGroupCategory";

  /**
   * @summary lấy danh mục nhóm danh mục có pagination
   */
  @Get("/")
  @Security("BearerAuth")
  @Middlewares(accessControlMiddleware("categoryGroupCategory", "get"))
  public async getCategoryGrCate(
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
      const { data, total } =
        await this.categoryGrCategoryService.getAllCategories(
          InputQueryCleaner.clean(option)
        );

      return Success(data, t(lang, "getCategory", "categories"), total);
    } catch (error: any) {
      console.log(error);
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GROUP_CATEGORY_NAME,
        error.message
      );
      return ExceptionError(error || t(lang, "getAllFailure", "categories"));
    }
  }

  /**
   * @summary tạo một nhóm danh mục nhóm
   */
  @Post("/")
  @Security("BearerAuth")
  @Middlewares(accessControlMiddleware("categoryGroupCategory", "post"))
  public async createCategoryGr(
    @Body() dto: InputCategoryGroupCategoryDto,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      // validate dto nếu có schema
      const result = validateAndSanitize(
        createCategoryGroupCategorySchema,
        dto,
        lang
      );
      if (result.error) {
        return result.error;
      }

      const categoryGroup =
        await this.categoryGrCategoryService.createCategoryGroupCategory(
          result.data
        );
      return Success(categoryGroup, t(lang, "createSuccess", "categoryGroup"));
    } catch (error: any) {
      console.log(error);
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GROUP_CATEGORY_NAME,
        error.message
      );
      if (error.status === 409) {
        return error;
      }
      return ExceptionError(t(lang, "createFailure", "categoryGroup"));
    }
  }

  /**
   * @summary xóa một danh mục nhóm theo id
   */
  @Delete("/delete-one")
  @Security("BearerAuth")
  @Middlewares(accessControlMiddleware("categoryGroupCategory", "delete"))
  public async deleteOneCategoryGrCategory(
    @Query() categoryGroupId: string,
    @Query() categoryId: string,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrCategoryService.deleteOne(
        categoryGroupId,
        categoryId
      );
      return Success(category, t(lang, "deleteSuccess", "categoryGroup"));
    } catch (error: any) {
      console.log(error);
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GROUP_CATEGORY_NAME,
        error.message
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categoryGroup")
      );
    }
  }

  /**
   * @summary xóa một nhóm danh mục nhóm
   */
  @Delete("/delete-many")
  @Security("BearerAuth")
  @Middlewares(accessControlMiddleware("categoryGroupCategory", "delete"))
  public async deleteManyCategoryGrCategory(
    @Body() dto: InputCategoryGroupCategoryDto,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrCategoryService.deleteMany(dto);
      return Success(category, t(lang, "deleteSuccess", "categoryGroup"));
    } catch (error: any) {
      console.log(error);
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GROUP_CATEGORY_NAME,
        error.message
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categoryGroup")
      );
    }
  }
}
