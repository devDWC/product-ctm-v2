// src/controllers/public/category.controller.ts
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
  UploadedFile,
  FormField,
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
  ProcessError,
} from "../../shared/utils/response.utility";
import {
  CreateCategoryGroupDto,
  UpdateCategoryGroupDto,
  inputCategoryGroupDto,
  outputCategoryGroupDto,
} from "../../model/dto/categoryGroup/categoryGroup.dto";
import {
  createCategoryGroupSchema,
  updateCategoryGroupSchema,
} from "../../shared/validators/categoryGroup.validator";
import { t } from "../../locales";
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import { S3Service } from "../../services/helper-services/s3.service";
import { v4 as uuidv4 } from "uuid";
import { InputQuery } from "../../model/base/input-query.dto";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { CategoryGrService } from "../../services/mgo-services/categoriesGroup-service/admin/categoryGroup.admin.service";
import { success } from "zod";
@Tags("CategoryGroup")
@Route("/v1/admin/category-group")
export class CategoryGroupController extends Controller {
  private categoryGrService = new CategoryGrService();
  private readonly _s3Service = new S3Service();

  @Get("/")
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
        option
      );
      console.log("data", data);
      const mapped = data.map((item: any) => new outputCategoryGroupDto(item));
      return Success(mapped, t(lang, "getCategory", "categories"), total);
    } catch (error: any) {
      console.log(error);
      return ExceptionError(error || t(lang, "getAllFailure", "categories"));
    }
  }

  @Post("/")
  // @Security("BearerAuth")
  // @Middlewares(accessControlMiddleware("categoryGroups", "create"))
  public async createCategoryGr(
    @Body() dto: inputCategoryGroupDto,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    // const dto: CreateCategoryGroupDto = {
    //   name,
    //   slug,
    //   description,
    //   userCreate,
    // };

    _logSingletonService.info("Creating category group", dto);
    try {
      // validate dto nếu có schema
      const result = validateAndSanitize(createCategoryGroupSchema, dto, lang);
      if (result.error) {
        return result.error;
      }

      const categoryGroup = await this.categoryGrService.createCategory(
        result.data
      );
      return Success(categoryGroup, t(lang, "createSuccess", "categoryGroups"));
    } catch (error: any) {
      if (error.status === 409) {
        return error;
      }
      return ExceptionError(t(lang, "createFailure", "categoryGroups"));
    }
  }

  @Put("/{id}")
  // @Middlewares([accessControlMiddleware("categories", "update")])
  public async updateCategoryGr(
    @Path() id: string,
    @Body() dto: inputCategoryGroupDto,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const result = validateAndSanitize(updateCategoryGroupSchema, dto, lang);
      if (result.error) {
        return result.error;
      }

      const category = await this.categoryGrService.updateCategory(
        id,
        result.data
      );

      if (!category) {
        return NotfoundError(t(lang, "notFound", "categories"));
      }

      return Success(category, t(lang, "updateSuccess", "categories"));
    } catch (error: any) {
      if (error.status === 409 || error.status === 404) {
        return error;
      }
      return ExceptionError(
        error?.message || t(lang, "updateFailure", "categories")
      );
    }
  }

  @Delete("/{id}")
  // @Middlewares([accessControlMiddleware("categories", "delete")])
  public async deleteHardCategoryGr(
    @Path() id: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrService.deleteHardCategory(id);
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }

  @Put("/temp/{id}")
  // @Middlewares([accessControlMiddleware("categories", "update")])
  public async deleteSoftCategoryGr(
    @Path() id: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrService.deleteSoftCategory(id);
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }

  @Get("{id}")
  // @Middlewares([accessControlMiddleware("categories", "update")])
  public async getCategoryGrById(
    @Path() id: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryGrService.getCategoryById(id);
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }
}
