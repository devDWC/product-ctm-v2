import {
  CreatePromotionUserLimitDto,
  VerifyPromotionDto,
} from "./../../model/dto/promotion/promotion-user-limit.dto";
import {
  Route,
  Tags,
  Controller,
  Post,
  Security,
  Middlewares,
  FormField,
  UploadedFiles,
  Header,
  UploadedFile,
  Put,
  Path,
  Body,
  Query,
  Get,
  Delete,
} from "tsoa";
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import { ApiResponse } from "../../model/base/response.dto";
import { CreatePromotionDto } from "../../model/dto/promotion/promotion.dto";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import { createPromotionSchema } from "../../shared/validators/promotion.validator";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { S3Service } from "../../services/helper-services/s3.service";
import { PromotionService } from "../../services/mgo-services/promotion-service/admin/promotion.admin.service";
import { v4 as uuidv4 } from "uuid";
import {
  ConflictError,
  ExceptionError,
  NotfoundError,
  ProcessError,
  Success,
} from "../../shared/utils/response.utility";
import { t } from "../../locales";
import {
  InputQuery,
  InputQueryCleaner,
} from "../../model/base/input-query.dto";
import { CreateProductPromotionDto } from "../../model/dto/promotion/product-promotion.dto";

@Tags("Promotion")
@Route("/v1/admin/promotion")
export class PromotionController extends Controller {
  private readonly _s3Service = new S3Service();
  private readonly promotionService = new PromotionService();
  private PROMOTION_NAME = "Promotion";
  private ORGANIZATION = "chothongminh";

  /**
   * @summary Lấy danh sách promotion (pagination)
   */
  @Get("/getPromotionByPagination")
  public async getPromotionsPagination(
    @Query() search?: string,
    @Query() pageCurrent: number = 1,
    @Query() pageSize: number = 10,
    @Query() sortList?: string,
    @Query() conditions?: string,
    @Header("X-Language") lang?: string
  ) {
    try {
      const option: InputQuery = {
        search,
        pageCurrent,
        pageSize,
        sortList: sortList ? JSON.parse(sortList) : [],
        conditions: conditions ? JSON.parse(conditions) : [],
      };

      const res = await this.promotionService.getPromotionsPagination(
        InputQueryCleaner.clean(option)
      );

      _logSingletonService.info(t(lang, "getListSuccess", "promotion"), res);
      return Success(
        res.data,
        t(lang, "getListSuccess", "promotion"),
        res.total
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        error.message,
        t(lang, "getListFailure", "promotion")
      );
      return ExceptionError(
        error?.message || t(lang, "getListFailure", "promotion")
      );
    }
  }

  /**
   * @summary Lấy promotion theo promotionId
   */
  @Get("/{promotionId}")
  public async getPromotionById(
    @Path() promotionId: string,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.promotionService.getPromotionById(promotionId);

      if (!res) {
        _logSingletonService.businessErrorLog(
          this.PROMOTION_NAME,
          t(lang, "notFound", "promotion"),
          promotionId
        );
        return NotfoundError(t(lang, "notFound", "promotion"));
      }

      _logSingletonService.info(
        t(lang, "getSuccess", "promotion"),
        promotionId
      );
      return Success(res, t(lang, "getSuccess", "promotion"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        error.message,
        t(lang, "getFailure", "promotion")
      );
      return ExceptionError(
        error?.message || t(lang, "getFailure", "promotion")
      );
    }
  }

  /**
   * @summary Lấy danh sách product detail trong promotion
   */
  @Get("/getProductDetailInPromotion/{promotionId}")
  public async getProductDetailsInPromotion(
    @Path() promotionId: string,
    @Query() pageCurrent: number = 1,
    @Query() pageSize: number = 10,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.promotionService.getProductDetailsInPromotion(
        promotionId,
        pageCurrent,
        pageSize
      );

      if (res.total === 0) {
        return Success(
        res.data,
        t(lang, "notFound", "productPromotion"),
        res.total
      );
      }

      return Success(
        res.data,
        t(lang, "getListSuccess", "productPromotion"),
        res.total
      );
    } catch (error: any) {
      return ExceptionError(
        error?.message || t(lang, "getListFailure", "productPromotion")
      );
    }
  }

  /**
   * @summary Lấy danh sách product detail + promotion theo tenant
   */
  @Get("/getProductDetailPromotion/{promotionId}")
  public async getProductDetailsPromotion(
    @Path() promotionId: string,
    @Query() tenantId: number,
    @Query() pageSize: number = 10,
    @Query() pageCurrent: number = 1,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.promotionService.getProductDetailsPromotion(
        promotionId,
        tenantId,
        pageSize,
        pageCurrent
      );

      if (res.data.length === 0) {
        return NotfoundError(t(lang, "notFound", "productPromotion"));
      }

      return Success(
        res.data,
        t(lang, "getListSuccess", "productPromotion"),
        res.total
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        t(lang, error.message)
      );
      return ExceptionError(
        error?.message || t(lang, "getListFailure", "productPromotion")
      );
    }
  }

  /**
   * @summary Tạo mới một chương trình khuyến mãi
   */
  @Post("/")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("promotion", "create")])
  public async createPromotion(
    @FormField() name: string,
    @FormField() description?: string,
    @FormField() type?: string,
    @FormField() color_code?: string,
    @FormField() background_color_code?: string,
    @FormField() background_color_promotion_code?: string,
    @FormField() start_time?: Date,
    @FormField() end_time?: Date,
    @FormField() tenantId?: number,
    @FormField() is_recurring?: string,
    @FormField() recurring_config?: string,
    @FormField() status?: boolean,
    @FormField() userUpdate?: string,
    @FormField() codeName?: string,
    @FormField() index?: number,
    @FormField() value1?: string,
    @FormField() value2?: string,
    @FormField() value3?: string,
    @FormField() number1?: number,
    @FormField() number2?: number,
    @FormField() number3?: number,
    @FormField() bool1?: boolean,
    @FormField() bool2?: boolean,
    @FormField() bool3?: boolean,
    @FormField() limit_items?: number,
    @FormField() folderPath?: string,
    @FormField() distinctive?: string,
    @UploadedFile() banner_img?: Express.Multer.File,
    @UploadedFile() logo_img?: Express.Multer.File,
    @UploadedFile() icon_img?: Express.Multer.File,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    const dto: CreatePromotionDto = {
      name,
      description,
      type,
      color_code,
      tenantId,
      codeName,
      index,
      start_time,
      end_time,
      is_recurring,
      recurring_config,
      status,
      userUpdate,
      background_color_promotion_code,
      background_color_code,
      limit_items,
      value1,
      value2,
      value3,
      number1,
      number2,
      number3,
      bool1,
      bool2,
      bool3,
    };

    const result = validateAndSanitize(createPromotionSchema, dto, lang);
    if (result.error) {
      _logSingletonService.businessErrorLog(
        this.PROMOTION_NAME,
        result.error.message,
        result.error.message
      );
      return result.error;
    }
    const distinctivePath = uuidv4();
    try {
      // 1) Gom các file (banner + logo) vào 1 mảng và nhớ thứ tự qua fileKeys
      const filesToUpload = [];
      const fileKeys: any[] = []; // giữ thứ tự tương ứng với filesToUpload

      if (banner_img) {
        filesToUpload.push(banner_img);
        fileKeys.push("banner_img");
      }

      if (logo_img) {
        filesToUpload.push(logo_img);
        fileKeys.push("logo_img");
      }

      if (icon_img) {
        filesToUpload.push(icon_img);
        fileKeys.push("icon_img");
      }

      // 2) Upload 1 lần duy nhất (nếu có file)
      let savedBanner = null;
      let savedLogo = null;
      let savedIcon = null;
      if (filesToUpload.length > 0) {
        const uploadResult = await this._s3Service.uploadMultipleFilesAsync(
          filesToUpload,
          folderPath || "promotion",
          distinctive || distinctivePath
        );

        // uploadMultipleFilesAsync của bạn trả về fileNames là JSON string
        const fileNames = JSON.parse(uploadResult.fileNames || "[]");

        // map fileNames theo fileKeys (giữ đúng thứ tự)
        fileNames.forEach((fileName: any, idx: number) => {
          const key = fileKeys[idx];
          const url = `/${this.ORGANIZATION}/${uploadResult.folderPath}/${fileName}`;
          if (key === "banner_img") savedBanner = url;
          if (key === "logo_img") savedLogo = url;
          if (key === "icon_img") savedIcon = url;
        });
      }

      // 3) Gọi service tạo promotion (nếu không có file thì vẫn dùng req.body)
      const promotionPayload = {
        ...dto,
        // chỉ set nếu có file uploaded, nếu không giữ giá trị từ body (nếu có)
        ...(savedBanner ? { banner_img: savedBanner } : {}),
        ...(savedLogo ? { logo_img: savedLogo } : {}),
        ...(savedIcon ? { icon_img: savedIcon } : {}),
      };

      const promotion = await this.promotionService.createPromotion(
        promotionPayload
      );

      if (promotion) {
        return Success(promotion, t(lang, "createSuccess", "promotion"));
      } else {
        _logSingletonService.businessErrorLog(
          this.PROMOTION_NAME,
          t(lang, "createFailure", "promotion")
        );
        return ConflictError(t(lang, "conflict", "promotion"));
      }
    } catch (error: any) {
      // 4) Rollback: xóa folder đã upload (nếu có)
      try {
        if (banner_img || logo_img || icon_img) {
          this._s3Service.deleteFolder(
            folderPath || "promotion",
            distinctive || distinctivePath
          );
        }
      } catch (rollbackErr) {
        console.error("Rollback delete folder error:", rollbackErr);
      }
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        error.message
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Cập nhật một chương trình khuyến mãi
   */
  @Put("/{promotionId}")
  @Security("BearerAuth")
  @Middlewares([accessControlMiddleware("promotion", "update")])
  public async updatePromotion(
    @Path() promotionId: string,

    @FormField() name: string,
    @FormField() description?: string,
    @FormField() type?: string,
    @FormField() color_code?: string,
    @FormField() background_color_code?: string,
    @FormField() background_color_promotion_code?: string,
    @FormField() start_time?: Date,
    @FormField() end_time?: Date,
    @FormField() tenantId?: number,
    @FormField() is_recurring?: string,
    @FormField() recurring_config?: string,
    @FormField() status?: boolean,
    @FormField() userUpdate?: string,
    @FormField() codeName?: string,
    @FormField() index?: number,
    @FormField() value1?: string,
    @FormField() value2?: string,
    @FormField() value3?: string,
    @FormField() number1?: number,
    @FormField() number2?: number,
    @FormField() number3?: number,
    @FormField() bool1?: boolean,
    @FormField() bool2?: boolean,
    @FormField() bool3?: boolean,
    @FormField() limit_items?: number,
    @FormField() folderPath?: string,
    @FormField() distinctive?: string,
    @UploadedFile() banner_img?: Express.Multer.File,
    @UploadedFile() logo_img?: Express.Multer.File,
    @UploadedFile() icon_img?: Express.Multer.File,

    @Header("X-Language") lang?: string
  ): Promise<ApiResponse> {
    const dto: CreatePromotionDto = {
      name,
      description,
      type,
      color_code,
      tenantId,
      codeName,
      index,
      start_time,
      end_time,
      is_recurring,
      recurring_config,
      status,
      userUpdate,
      background_color_promotion_code,
      background_color_code,
      limit_items,
      value1,
      value2,
      value3,
      number1,
      number2,
      number3,
      bool1,
      bool2,
      bool3,
    };

    const result = validateAndSanitize(createPromotionSchema, dto, lang);
    if (result.error) {
      _logSingletonService.businessErrorLog(
        this.PROMOTION_NAME,
        result.error.message,
        result.error.message
      );
      return result.error;
    }
    const distinctivePath = uuidv4();
    try {
      // 1) Gom các file (banner + logo) vào 1 mảng và nhớ thứ tự qua fileKeys
      const filesToUpload = [];
      const fileKeys: any[] = []; // giữ thứ tự tương ứng với filesToUpload

      if (banner_img) {
        filesToUpload.push(banner_img);
        fileKeys.push("banner_img");
      }

      if (logo_img) {
        filesToUpload.push(logo_img);
        fileKeys.push("logo_img");
      }

      if (icon_img) {
        filesToUpload.push(icon_img);
        fileKeys.push("icon_img");
      }

      // 2) Upload 1 lần duy nhất (nếu có file)
      let savedBanner = null;
      let savedLogo = null;
      let savedIcon = null;
      if (filesToUpload.length > 0) {
        const uploadResult = await this._s3Service.uploadMultipleFilesAsync(
          filesToUpload,
          folderPath || "promotion",
          distinctive || distinctivePath
        );

        // uploadMultipleFilesAsync của bạn trả về fileNames là JSON string
        const fileNames = JSON.parse(uploadResult.fileNames || "[]");

        // map fileNames theo fileKeys (giữ đúng thứ tự)
        fileNames.forEach((fileName: any, idx: number) => {
          const key = fileKeys[idx];
          const url = `/${this.ORGANIZATION}/${uploadResult.folderPath}/${fileName}`;
          if (key === "banner_img") savedBanner = url;
          if (key === "logo_img") savedLogo = url;
          if (key === "icon_img") savedIcon = url;
        });
      }

      // 3) Gọi service tạo promotion (nếu không có file thì vẫn dùng req.body)
      const promotionPayload: Record<string, any> = {
        ...dto,
        // chỉ set nếu có file uploaded, nếu không giữ giá trị từ body (nếu có)
        ...(savedBanner ? { banner_img: savedBanner } : {}),
        ...(savedLogo ? { logo_img: savedLogo } : {}),
        ...(savedIcon ? { icon_img: savedIcon } : {}),
      };

      Object.keys(promotionPayload).forEach((key) => {
        if (promotionPayload[key] === "" || promotionPayload[key] === null) {
          delete promotionPayload[key];
        }
      });

      const promotion = await this.promotionService.updatePromotion(
        promotionId,
        promotionPayload
      );

      if (promotion) {
        return Success(promotion, t(lang, "updateSuccess", "promotion"));
      } else {
        _logSingletonService.businessErrorLog(
          this.PROMOTION_NAME,
          t(lang, "notFound", "promotion")
        );
        try {
          if (banner_img || logo_img || icon_img) {
            this._s3Service.deleteFolder(
              folderPath || "promotion",
              distinctive || distinctivePath
            );
          }
        } catch (rollbackErr) {
          console.error("Rollback delete folder error:", rollbackErr);
        }

        return NotfoundError(t(lang, "notFound", "promotion"));
      }
    } catch (error: any) {
      // 4) Rollback: xóa folder đã upload (nếu có)
      try {
        if (banner_img || logo_img || icon_img) {
          this._s3Service.deleteFolder(
            folderPath || "promotion",
            distinctive || distinctivePath
          );
        }
      } catch (rollbackErr) {
        console.error("Rollback delete folder error:", rollbackErr);
      }
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        error.message
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Xóa promotion
   */
  @Delete("/{promotionId}")
  public async deletePromotion(
    @Path() promotionId: string,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.promotionService.deletePromotion(promotionId);

      if (!res) {
        return NotfoundError(t(lang, "notFound", "promotion"));
      }

      return Success(res, t(lang, "deleteSuccess", "promotion"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        t(lang, error.message)
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "promotion")
      );
    }
  }

  /**
   * @summary Tạo hoặc cập nhật product promotion
   */
  @Post("/createOrUpdateProductPromotion")
  public async createOrUpdateProductPromotion(
    @Body() productPromotion: CreateProductPromotionDto,
    @Header("X-Language") lang: string = "vi"
  ) {
    try {
      const res = await this.promotionService.createOrUpdateProductPromotion(
        productPromotion,
        lang
      );
      if ("status" in res) {
        return res;
      }
      return Success(res, t(lang, "saveSuccess", "productPromotion"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        t(lang, error.message)
      );
      return ExceptionError(
        error?.message || t(lang, "saveFailure", "productPromotion")
      );
    }
  }

  /**
   * @summary Xóa product promotion
   */
  @Delete("/product-promotion/{productPromotionId}")
  public async deleteProductPromotion(
    @Path() productPromotionId: string,
    @Header("X-Language") lang: string = "en"
  ) {
    try {
      const res = await this.promotionService.deleteProductPromotion(
        productPromotionId,
        lang
      );
      if (!res) {
        return NotfoundError(t(lang, "notFound", "productPromotion"));
      }
      return Success(res, t(lang, "deleteSuccess", "productPromotion"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        t(lang, error.message)
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "productPromotion")
      );
    }
  }

  /**
   * @summary Xác minh promotion
   */
  @Post("/verify")
  public async verifyPromotion(
    @Body() promotionInfo: VerifyPromotionDto,
    @Header("X-Language") lang: string = "en"
  ) {
    try {
      const res = await this.promotionService.verifyPromotion(
        promotionInfo,
        lang
      );
      if (res.length > 0) {
        return ProcessError(
          t(lang, "verifyFailure", "promotion"),
          400,
          "",
          "",
          res
        );
      }
      return Success(res, t(lang, "verifySuccess", "promotion"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        t(lang, error.message)
      );
      return ExceptionError(
        error?.message || t(lang, "verifyFailure", "promotion")
      );
    }
  }

  /**
   * @summary Tạo promotion user limit
   */
  @Post("/createPromotionUserLimit")
  public async createPromotionUserLimit(
    @Body() promotionUser: CreatePromotionUserLimitDto,
    @Header("X-Language") lang: string = "vi"
  ) {
    try {
      const res = await this.promotionService.createPromotionUserLimit(
        promotionUser,
        lang
      );
      if ("status" in res) {
        return res;
      }
      return Success(res, t(lang, "createSuccess", "promotionUserLimit"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.PROMOTION_NAME,
        t(lang, error.message)
      );
      return ExceptionError(
        error?.message || t(lang, "createFailure", "promotionUserLimit")
      );
    }
  }
}
