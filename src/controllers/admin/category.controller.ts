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
import { InputQuery } from "../../model/base/input-query.dto";

@Tags("Category")
@Route("/v1/admin/categories")
export class CategoryController extends Controller {
  private categoryService = new CategoryService();
  private readonly _s3Service = new S3Service();

  /**
   * @summary Lấy danh sách danh mục không phải là parent.
   */
  @Get("/getCategoryWithoutParentId")
  @Security("BearerAuth")
  public async getCategoryWithoutParentId(
    /**
     * @summary Lấy danh sách danh mục không phải là parent.
     */
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
      const categories = await this.categoryService.getCategoryWithoutParentId(
        option
      );

      _logSingletonService.error(
        t(lang, "getChildrenSuccess", "categories"),
        categories
      );
      return Success(categories, t(lang, "getChildrenSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(
        t(lang, "getChildrenFailure", "categories"),
        error
      );
      return ExceptionError(
        error?.message || t(lang, "getChildrenFailure", "categories")
      );
    }
  }

  /**
   * @summary Lấy danh sách danh mục có pagination và search.
   */
  @Get("/")
  @Security("BearerAuth")
  public async getAllCategories(
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

      const { data, total } = await this.categoryService.getAllCategories(
        option
      );

      _logSingletonService.info(t(lang, "getAllSuccess", "categories"), data);
      return Success(data, t(lang, "getAllSuccess", "categories"), total);
    } catch (error: any) {
      _logSingletonService.error(t(lang, "getAllFailure", "categories"), error);
      return ExceptionError(
        error?.message || t(lang, "getAllFailure", "categories")
      );
    }
  }

  /**
   * @summary Lấy một danh mục dựa vào categoryId.
   */
  @Get("/{categoryId}")
  @Security("BearerAuth")
  public async getCategoryById(
    @Path() categoryId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.getCategoryById(categoryId);
      if (!category) {
        _logSingletonService.error(t(lang, "notFound", "categories"), category);
        return NotfoundError(t(lang, "notFound", "categories"));
      }

      _logSingletonService.info(
        t(lang, "getOneSuccess", "categories"),
        category
      );
      return Success(category, t(lang, "getOneSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "getOneFailure", "categories"), error);
      return ExceptionError(
        error?.message || t(lang, "getOneFailure", "categories")
      );
    }
  }

  /**
   * @summary Lấy một danh mục dựa vào parentId.
   */
  @Get("/parent/{parentId}")
  @Security("BearerAuth")
  public async getCategoriesByParentId(
    @Path() parentId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const categories = await this.categoryService.getCategoriesByParentId(
        parentId
      );

      _logSingletonService.info(
        t(lang, "getChildrenSuccess", "categories"),
        categories
      );
      return Success(
        categories,
        t(lang, "getChildrenSuccess", "categories"),
        categories.length
      );
    } catch (error: any) {
      _logSingletonService.error(
        t(lang, "getChildrenFailure", "categories"),
        error
      );
      return ExceptionError(
        error?.message || t(lang, "getChildrenFailure", "categories")
      );
    }
  }

  /**
   * @summary Lấy danh sách danh mục theo cấp.
   */
  @Get("/sort/level/{id}")
  @Security("BearerAuth")
  public async getListCategoryLevel(
    @Path() id: number,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const categories = await this.categoryService.getListCategoryLevel(id);
      _logSingletonService.info(
        t(lang, "getChildrenSuccess", "categories"),
        categories
      );
      return Success(categories, t(lang, "getChildrenSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(
        t(lang, "getChildrenFailure", "categories"),
        error
      );
      return ExceptionError(
        error?.message || t(lang, "getChildrenFailure", "categories")
      );
    }
  }

  @Get("/getTest")
  public async getTest(): Promise<any> {
    try {
      _logSingletonService.error("Creating user đang bị lỗi 123", "hahaha");
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * @summary Tạo mới một danh mục.
   */
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
    try {
      if (image_url) {
        const upload = await this._s3Service.uploadSingleFileAsync(
          image_url,
          dto.folderPath || "categories",
          distinctive
        );
        if (!upload) {
          _logSingletonService.error(
            t(lang, "uploadFailed", "categories"),
            upload
          );
          return ProcessError(t(lang, "uploadFailed", "categories"));
        }
        dto.image_url = `/${upload.bucketName}/${upload.key}` || "";
      }
      const result = validateAndSanitize(createCategorySchema, dto, lang);
      if (result.error) {
        _logSingletonService.error(result.error.message, result.error);
        return result.error;
      }

      const category = await this.categoryService.createCategory(result.data);

      _logSingletonService.info(
        t(lang, "createSuccess", "categories"),
        category
      );
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

      _logSingletonService.error(t(lang, "createFailure", "categories"), error);

      return ExceptionError(t(lang, "createFailure", "categories"));
    }
  }

  /**
   * @summary Cập nhật một danh mục.
   */
  @Put("/{categoryId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("categories", "update")])
  public async updateCategory(
    @Path() categoryId: string,

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
          _logSingletonService.error(
            t(lang, "uploadFailed", "categories"),
            upload
          );
          return ProcessError(t(lang, "uploadFailed", "categories"));
        }
        dto.image_url = `/${upload.bucketName}/${upload.key}` || "";
      }

      const result = validateAndSanitize(updateCategorySchema, dto, lang);
      if (result.error) {
        _logSingletonService.error(result.error.message, result);
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

        _logSingletonService.error(t(lang, "notFound", "categories"), category);
        return NotfoundError(t(lang, "notFound", "categories"));
      }

      _logSingletonService.error(
        t(lang, "updateSuccess", "categories"),
        category
      );
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

      _logSingletonService.error(t(lang, "updateFailure", "categories"), error);
      return ExceptionError(
        error?.message || t(lang, "updateFailure", "categories")
      );
    }
  }

  /**
   * @summary Xóa một danh mục theo categoryId.
   */
  @Delete("/{categoryId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("categories", "delete")])
  public async deleteHardCategory(
    @Path() categoryId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.deleteHardCategory(
        categoryId
      );
      if (!category) {
        _logSingletonService.error(t(lang, "notFound", "categories"), category);
        return NotfoundError(t(lang, "notFound", "categories"));
      }

      _logSingletonService.info(
        t(lang, "deleteSuccess", "categories"),
        category
      );
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "deleteFailure", "categories"), error);
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }

  /**
   * @summary Xóa mềm một danh mục theo categoryId.
   */
  @Put("/temp/{categoryId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("categories", "update")])
  public async deleteSoftCategory(
    @Path() categoryId: string,
    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    try {
      const category = await this.categoryService.deleteSoftCategory(
        categoryId
      );
      if (!category) {
        _logSingletonService.error(t(lang, "notFound", "categories"), category);
        return NotfoundError(t(lang, "notFound", "categories"));
      }

      _logSingletonService.info(
        t(lang, "deleteSuccess", "categories"),
        category
      );
      return Success(category, t(lang, "deleteSuccess", "categories"));
    } catch (error: any) {
      _logSingletonService.error(t(lang, "deleteFailure", "categories"), error);
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "categories")
      );
    }
  }
}
