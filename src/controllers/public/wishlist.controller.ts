// src/controllers/wishlist/wishlist.controller.ts
import {
  Controller,
  Route,
  Tags,
  Post,
  Get,
  Delete,
  Body,
  Query,
  Header,
} from "tsoa";
import { CreateWishListDto } from "../../model/dto/wishlist/wishlist.dto";
import {
  Success,
  ExceptionError,
  NotfoundError,
} from "../../shared/utils/response.utility";
import { t } from "../../locales";
import { WishlistService } from "../../services/mgo-services/wishlish-service/public/wishlist.public.service";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { validateAndSanitize } from "../../shared/helper/validateAndSanitize";
import { createWishlistSchema } from "../../shared/validators/wishlist.validator";

@Tags("Wishlist")
@Route("/v1/public/wishlist")
export class WishlistController extends Controller {
  private wishlistService = new WishlistService();
  private WISHLIST_NAME = "Wishlist";

  /**
   * @summary Tạo wishlist mới
   */
  @Post("/")
  public async createWishlist(
    @Body() wishlist: CreateWishListDto,
    @Header("X-Language") lang?: string
  ) {
    try {
      const result = validateAndSanitize(createWishlistSchema, wishlist, lang);

      if (result.error) {
        _logSingletonService.businessErrorLog(
          this.WISHLIST_NAME,
          result.error.message
        );
        return result.error;
      }
      const res = await this.wishlistService.createWishlist(wishlist, lang);

      if (res.status === 409) {
        _logSingletonService.businessErrorLog(
          this.WISHLIST_NAME,
          res.message,
          t(lang, "existing", "wishlist")
        );
        return res;
      }
      _logSingletonService.info(res.message, t(lang, "existing", "wishlist"));
      return res;
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.WISHLIST_NAME,
        error.message,
        t(lang, "createFailure", "wishlist")
      );
      return ExceptionError(
        error?.message || t(lang, "createFailure", "wishlist")
      );
    }
  }

  /**
   * @summary Lấy danh sách wishlist theo userId (có pagination)
   */
  @Get("/")
  public async getWishlistByUser(
    @Query() userId: string,
    @Query() pageCurrent: number = 1,
    @Query() pageSize: number = 10,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.wishlistService.getWishListByUserId(
        pageCurrent,
        pageSize,
        userId
      );

      if (!res || res.data.length === 0) {
        _logSingletonService.businessErrorLog(
          this.WISHLIST_NAME,
          t(lang, "notFound", "wishlist"),
          userId.toString()
        );
        return NotfoundError(t(lang, "notFound", "wishlist"));
      }

      _logSingletonService.info(t(lang, "getListSuccess", "wishlist"), res);
      return Success(
        res.data,
        t(lang, "getListSuccess", "wishlist"),
        res.total
      );
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.WISHLIST_NAME,
        error.message,
        t(lang, "getListFailure", "wishlist")
      );
      return ExceptionError(
        error?.message || t(lang, "getListFailure", "wishlist")
      );
    }
  }

  /**
   * @summary Xóa một wishlist
   */
  @Delete("/")
  public async deleteWishlist(
    @Body() wishlist: CreateWishListDto,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.wishlistService.deleteWishlist(wishlist);

      if (!res) {
        _logSingletonService.businessErrorLog(
          this.WISHLIST_NAME,
          t(lang, "notFound", "wishlist"),
          wishlist
        );
        return NotfoundError(t(lang, "notFound", "wishlist"));
      }

      _logSingletonService.info(t(lang, "deleteSuccess", "wishlist"), wishlist);
      return Success(res, t(lang, "deleteSuccess", "wishlist"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.WISHLIST_NAME,
        error.message,
        t(lang, "deleteFailure", "wishlist")
      );
      return ExceptionError(
        error?.message || t(lang, "deleteFailure", "wishlist")
      );
    }
  }
}
