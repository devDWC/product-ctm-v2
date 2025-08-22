// src/controllers/public/category.controller.ts
import {
  Body,
  Controller,
  Post,
  Put,
  Delete,
  Path,
  Route,
  Tags,
  Middlewares,
  Header,
} from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import {
  Success,
  ExceptionError,
  NotfoundError,
} from "../../shared/utils/response.utility";
import { CategoryService } from "../../service/mgo-services/categories-service/admin/category.admin.service";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../model/dto/category/category.dto";
import { validateRequest } from "../../middleware/validateRequest.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validators/categories.validator";
import { t } from "../../locales";

@Tags("Category")
@Route("/v1/public/categories")
export class CategoryController extends Controller {
  private categoryService = new CategoryService();

  @Post("/")
  @Middlewares([
    validateRequest(createCategorySchema, { namespace: "categories" }),
  ])
  public async createCategory(
    @Body() body: CreateCategoryDto,
    @Header("Accept-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.createCategory(body);
      return Success(category, t(lang, "createSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(t(lang, "createFailure", "categories"));
    }
  }

  @Put("/{categoryId}")
  @Middlewares([
    validateRequest(updateCategorySchema, { namespace: "categories" }),
  ])
  public async updateCategory(
    @Path() categoryId: string,
    @Body() body: UpdateCategoryDto,
    @Header("Accept-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.updateCategory(
        categoryId,
        body
      );
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "updateSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "updateFailure", "categories")
      );
    }
  }

  @Delete("/{categoryId}")
  public async deleteCategory(
    @Path() categoryId: string,
    @Header("Accept-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.deleteCategory(categoryId);
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }
}
