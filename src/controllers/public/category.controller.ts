import { Controller, Get, Path, Route, Tags, Header } from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import {
  Success,
  ExceptionError,
  NotfoundError,
} from "../../shared/utils/response.utility";
import { t } from "../../locales";
import { CategoryService } from "../../services/mgo-services/categories-service/public/category.public.service";



@Tags("Category")
@Route("/v1/public/categories")
export class CategoryController extends Controller {
  private categoryService = new CategoryService();

  @Get("/")
  public async getAllCategories(
    @Header("Accept-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const { data, total } = await this.categoryService.getAllCategories();
      return Success(data, t(lang, "getAllSuccess", "categories"), total);
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "categories")
      );
    }
  }

  @Get("/{categoryId}")
  public async getCategoryById(
    @Path() categoryId: string,
    @Header("Accept-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.getCategoryById(categoryId);
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "getOneSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "getOneFailure", "categories")
      );
    }
  }

  @Get("/parent/{parentId}")
  public async getCategoriesByParentId(
    @Path() parentId: number,
    @Header("Accept-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const categories = await this.categoryService.getCategoriesByParentId(
        parentId
      );
      return Success(categories, t(lang, "getChildrenSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "getChildrenFailure", "categories")
      );
    }
  }
}
