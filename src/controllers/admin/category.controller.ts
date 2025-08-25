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
} from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import {
  Success,
  ExceptionError,
  NotfoundError,
  ProcessError,
} from "../../shared/utils/response.utility";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "../../model/dto/category/category.dto";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../shared/validators/categories.validator";
import { t } from "../../locales";
import { CategoryService } from "../../services/mgo-services/categories-service/admin/category.admin.service";
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import { S3Service } from "../../services/helper-services/s3.service";
import { v4 as uuidv4 } from "uuid";
import { _logSingletonService } from "../../services/helper-services/log.service";

@Tags("Category")
@Route("/v1/admin/categories")
export class CategoryController extends Controller {
  private categoryService = new CategoryService();
  private readonly _s3Service = new S3Service();


  @Get("/")
  public async getTest(): Promise<any> {
    try {
      _logSingletonService.error("Creating user đang bị lỗi", "hahaha");
    } catch (error) {
      console.log(error);
    }

  }


  @Post("/")
  @Security("BearerAuth")
  @Middlewares(accessControlMiddleware("categories", "create"))
  public async createCategory(
    @FormField() name: string,
    @FormField() slug?: string,
    @FormField() description?: string,
    @FormField() meta_title?: string,
    @FormField() meta_keywords?: string,
    @FormField() meta_description?: string,
    @FormField() meta_slug?: string,
    @FormField() parentId?: number,
    @FormField() index?: number,
    @FormField() order?: number,
    @FormField() createUser?: number,
    @FormField() folderPath?: string,

    @UploadedFile() image_url?: Express.Multer.File,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    const dto: CreateCategoryDto = {
      name,
      slug,
      description,
      meta_title,
      meta_keywords,
      meta_description,
      meta_slug,
      parentId,
      index,
      order,
      createUser,
      folderPath,
    };
    const distinctive = uuidv4();
    _logSingletonService.info("Creating user", dto);
    try {
      if (image_url) {
        const upload = await this._s3Service.uploadSingleFileAsync(
          image_url,
          dto.folderPath || "categories",
          distinctive
        );
        if (!upload) {
          return ProcessError(t(lang, "uploadFailed", "categories"));
        }
        dto.image_url = `/${upload.bucketName}/${upload.key}` || "";
      }
      const result = validateAndSanitize(createCategorySchema, dto, lang);
      if (result.error) {
        return result.error;
      }

      const category = await this.categoryService.createCategory(result.data);
      return Success(category, t(lang, "createSuccess", "categories"));
    } catch (error: any) {
      if (image_url) {
        this._s3Service.deleteFolder(
          dto.folderPath || "categories",
          distinctive
        );
      }
      if (error.status === 409) {
        return error;
      }
      return ExceptionError(t(lang, "createFailure", "categories"));
    }
  }

  @Put("/{categoryId}")
  @Middlewares([accessControlMiddleware("categories", "update")])
  public async updateCategory(
    @Path() categoryId: string,

    @FormField() name: string = "abc",
    @FormField() slug?: string,
    @FormField() description?: string,
    @FormField() meta_title?: string,
    @FormField() meta_keywords?: string,
    @FormField() meta_description?: string,
    @FormField() meta_slug?: string,
    @FormField() parentId?: number,
    @FormField() index?: number,
    @FormField() order?: number,
    @FormField() createUser?: number,
    @FormField() folderPath?: string,

    @UploadedFile() image_url?: Express.Multer.File,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    const dto: UpdateCategoryDto = {
      name,
      slug,
      description,
      meta_title,
      meta_keywords,
      meta_description,
      meta_slug,
      parentId,
      index,
      order,
      createUser,
      folderPath,
    };

    const distinctive = uuidv4();
    try {
      if (image_url) {
        const upload = await this._s3Service.uploadSingleFileAsync(
          image_url,
          dto.folderPath || "categories",
          distinctive
        );
        if (!upload) {
          return ProcessError(t(lang, "uploadFailed", "categories"));
        }
        dto.image_url = `/${upload.bucketName}/${upload.key}` || "";
      }

      const result = validateAndSanitize(updateCategorySchema, dto, lang);
      if (result.error) {
        return result.error;
      }

      const category = await this.categoryService.updateCategory(
        categoryId,
        result.data
      );

      if (!category) {
        if (image_url) {
          // rollback file nếu category không tồn tại
          this._s3Service.deleteFolder(
            dto.folderPath || "categories",
            distinctive
          );
        }
        return NotfoundError(t(lang, "notFound", "categories"));
      }

      return Success(category, t(lang, "updateSuccess", "categories"));
    } catch (error: any) {
      if (image_url) {
        this._s3Service.deleteFolder(
          dto.folderPath || "categories",
          distinctive
        );
      }
      if (error.status === 409 || error.status === 404) {
        return error;
      }
      return ExceptionError(
        error?.message || t(lang, "updateFailure", "categories")
      );
    }
  }

  @Delete("/{categoryId}")
  @Middlewares([accessControlMiddleware("categories", "delete")])
  public async deleteHardCategory(
    @Path() categoryId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.deleteHardCategory(
        categoryId
      );
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }

  @Put("/temp/{categoryId}")
  @Middlewares([accessControlMiddleware("categories", "update")])
  public async deleteSoftCategory(
    @Path() categoryId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.deleteSoftCategory(
        categoryId
      );
      if (!category) return NotfoundError(t(lang, "notFound", "categories"));
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }
}
