// src/controllers/admin/category-group.controller.ts
import {
  Controller,
  Post,
  Put,
  Delete,
  Path,
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
import {
  Success,
  ExceptionError,
  NotfoundError,
} from "../../shared/utils/response.utility";
import {
  createCategoryGroupSchema,
  updateCategoryGroupSchema,
} from "../../shared/validators/categoryGroup.validator";
import { t } from "../../locales";
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import {
  InputQuery,
  InputQueryCleaner,
} from "../../model/base/input-query.dto";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { CategoryGrService } from "../../services/mgo-services/categories-group-service/admin/category-group.admin.service";
import { InputCategoryGroupDto } from "../../model/dto/categoryGroup/categoryGroup.dto";
@Tags("CategoryGroup")
@Route("/v1/admin/category-group")
export class CategoryGroupController extends Controller {
  private categoryGrService = new CategoryGrService();
  private CATEGORY_GR_NAME = "CategoryGroup";
  /**
   * @summary Lấy dánh sách category group có pagination và search
   */
  @Get("/")
  @Security("BearerAuth")
  @Middlewares(accessControlMiddleware("categoryGroup", "get"))
  public async getCategoryGr(
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
      const { data, total } = await this.categoryGrService.getAllCategories(
        InputQueryCleaner.clean(option)
      );
      return Success(data, t(lang, "getAllSuccess", "categoryGroup"), total);
    } catch (error: any) {
      console.log(error);
      return ExceptionError(error || t(lang, "getAllFailure", "categoryGroup"));
    }
  }

  /**
   * @summary Tạo mới một category group
   */
  @Post("/")
  @Security("BearerAuth")
  @Middlewares(accessControlMiddleware("categoryGroup", "create"))
  public async createCategoryGr(
    @Body() dto: InputCategoryGroupDto,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      // validate dto nếu có schema
      const result = validateAndSanitize(createCategoryGroupSchema, dto, lang);
      if (result.error) {
        return result.error;
      }

      const categoryGroup = await this.categoryGrService.createCategory(
        result.data
      );
      return Success(categoryGroup, t(lang, "createSuccess", "categoryGroup"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GR_NAME,
        error.message
      );
      if (error.status === 409) {
        return error;
      }
      return ExceptionError(t(lang, "createFailure", "categoryGroup"));
    }
  }

  /**
   * @summary Cập nhật một danh mục nhóm
   */
  @Put("/{categoryGroupId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("categoryGroup", "update")])
  public async updateCategoryGr(
    @Path() categoryGroupId: string,
    @Body() dto: InputCategoryGroupDto,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = validateAndSanitize(updateCategoryGroupSchema, dto, lang);
      if (result.error) {
        return result.error;
      }

      const category = await this.categoryGrService.updateCategory(
        categoryGroupId,
        result.data,
        lang
      );

      if (category && "status" in category) {
        return category;
      }

      return Success(category, t(lang, "updateSuccess", "categoryGroup"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GR_NAME,
        error.message
      );
      return ExceptionError(
        error?.message || t(lang, "updateFailure", "categoryGroup")
      );
    }
  }

  /**
   * @summary xóa một danh mục nhóm theo id
   */
  @Delete("/{categoryGroupId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("categoryGroup", "delete")])
  public async deleteHardCategoryGr(
    @Path() categoryGroupId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrService.deleteHardCategory(
        categoryGroupId
      );
      if (!category) {
        _logSingletonService.businessErrorLog(
          this.CATEGORY_GR_NAME,
          t(lang, "notFound", "categoryGroup")
        );
        return NotfoundError(t(lang, "notFound", "categoryGroup"));
      }
      return Success(category, t(lang, "deleteSuccess", "categoryGroup"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GR_NAME,
        error.message
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categoryGroup")
      );
    }
  }

  /**
   * @summary xóa mềm một danh mục nhóm the id
   */
  @Put("/temp/{categoryGroupId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("categoryGroup", "update")])
  public async deleteSoftCategoryGr(
    @Path() categoryGroupId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrService.deleteSoftCategory(
        categoryGroupId
      );
      if (!category) {
        _logSingletonService.businessErrorLog(
          this.CATEGORY_GR_NAME,
          t(lang, "notFound", "categoryGroup")
        );
        return NotfoundError(t(lang, "notFound", "categoryGroup"));
      }
      return Success(category, t(lang, "deleteSuccess", "categoryGroup"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GR_NAME,
        error.message
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categoryGroup")
      );
    }
  }

  /**
   * @summary lấy danh mục nhóm the id
   */
  @Get("/{categoryGroupId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("categoryGroup", "get")])
  public async getCategoryGrById(
    @Path() categoryGroupId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrService.getCategoryById(
        categoryGroupId
      );
      if (!category) {
        _logSingletonService.businessErrorLog(
          this.CATEGORY_GR_NAME,
          t(lang, "notFound", "categoryGroup")
        );
        return NotfoundError(t(lang, "notFound", "categoryGroup"));
      }
      return Success(category, t(lang, "getOneSuccess", "categoryGroup"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CATEGORY_GR_NAME,
        error.message
      );
      return ExceptionError(
        error?.message || t(lang, "getOneFailure", "categoryGroup")
      );
    }
  }
}
