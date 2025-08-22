// src/controllers/public/category.controller.ts
import { Controller, Get, Path, Route, Tags } from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import {
  Success,
  ExceptionError,
  NotfoundError,
} from "../../shared/utils/response.utility";
import { CategoryService } from "../../service/mgo-services/categories-service/public/category.public.service";

@Tags("Category")
@Route("/v1/public/categories")
export class CategoryController extends Controller {
  private categoryService = new CategoryService();

  @Get("/parent/{parentId}")
  public async getCategoriesByParentId(
    @Path() parentId: number
  ): Promise<ApiResponse> {
    try {
      const categories = await this.categoryService.getCategoriesByParentId(
        parentId
      );
      return Success(categories, "Lấy danh sách category con thành công");
    } catch (error: any) {
      return ExceptionError(error?.message || "Lỗi khi lấy category con");
    }
  }
}
