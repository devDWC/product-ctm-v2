import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Path,
  Post,
  Put,
  Query,
  Route,
  Tags,
} from "tsoa";
import { CartService } from "../../services/mgo-services/cart-service/admin/cart.admin.service";
import { CreateCartDto, CreateOneCartDto } from "../../model/dto/cart/cart.dto";
import { _logSingletonService } from "../../services/helper-services/log.service";
import { t } from "../../locales";
import {
  ExceptionError,
  NotfoundError,
  ProcessError,
  Success,
} from "../../shared/utils/response.utility";

@Tags("Cart")
@Route("/v1/public/cart")
export class CartController extends Controller {
  private cartService = new CartService();
  private CART_NAME = "Cart";

  /**
   * @summary Tạo nhiều cart items
   */
  @Post("/")
  public async createCartItems(
    @Body() cart: CreateCartDto,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.createCartItems(cart, lang);
      if (!res?.success) {
        _logSingletonService.businessErrorLog(
          this.CART_NAME,
          res?.message || t(lang, "createFailure", "cart"),
          res?.details
        );
        return ProcessError(res?.message || t(lang, "createFailure", "cart"));
      }
      _logSingletonService.info(res?.message);
      return Success(res.data, t(lang, "createSuccess", "cart"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "createFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Tạo 1 cart item
   */
  @Post("/one")
  public async createCartItem(
    @Body() cart: CreateOneCartDto,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.createCartItem(cart);
      _logSingletonService.info(t(lang, "createSuccess", "cart"));
      return Success(res, t(lang, "createSuccess", "cart"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "createFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Lấy danh sách cart theo userId (có pagination)
   */
  @Get("/")
  public async getCartByUser(
    @Query() userId: string,
    @Query() pageCurrent: number = 1,
    @Query() pageSize: number = 10,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.getCartByUserId(
        pageCurrent,
        pageSize,
        userId
      );

      if (!res || res.data.length === 0) {
        return NotfoundError(t(lang, "notFound", "cart"));
      }
      return Success(res.data, t(lang, "getListSuccess", "cart"), res.total);
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "getListFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Lấy cart theo cartId
   */
  @Get("/{cartId}")
  public async getCartById(
    @Path() cartId: string,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.getCartById(cartId);
      if (!res) {
        return NotfoundError(t(lang, "notFound", "cart"));
      }
      return Success(res, t(lang, "getSuccess", "cart"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "getFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Cập nhật số lượng cart item
   */
  @Put("/{cartId}")
  public async updateCart(
    @Path() cartId: string,
    @Query() quantity: number,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.updateCart(cartId, quantity);
      if (!res) {
        return NotfoundError(t(lang, "notFound", "cart"));
      }
      return Success(res, t(lang, "updateSuccess", "cart"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "updateFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Xoá 1 cart item theo cartId
   */
  @Delete("/{cartId}")
  public async deleteOneCartItem(
    @Path() cartId: string,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.deleteOneCartItem(cartId);
      if (!res) {
        return NotfoundError(t(lang, "notFound", "cart"));
      }
      return Success(res, t(lang, "deleteSuccess", "cart"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "deleteFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Xoá toàn bộ cart theo userId
   */
  @Delete("/user/{userId}")
  public async deleteCartByUserId(
    @Path() userId: string,
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.deleteCartByUserId(userId);
      if (!res) {
        return NotfoundError(t(lang, "notFound", "cart"));
      }
      return Success(res, t(lang, "deleteSuccess", "cart"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "deleteFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }

  /**
   * @summary Xoá nhiều cart items theo userId và list productDetailIds
   */
  @Delete("/user/{userId}/details")
  public async deleteCartByUserAndProductDetailIds(
    @Path() userId: string,
    @Body() productDetailIds: string[],
    @Header("X-Language") lang?: string
  ) {
    try {
      const res = await this.cartService.deleteCartByUserAndProductDetailIds(
        userId,
        productDetailIds
      );
      if (!res) {
        return NotfoundError(t(lang, "notFound", "cart"));
      }
      return Success(res, t(lang, "deleteSuccess", "cart"));
    } catch (error: any) {
      _logSingletonService.exceptionErrorLog(
        this.CART_NAME,
        error.message,
        t(lang, "deleteFailure", "cart")
      );
      return ExceptionError(error.message);
    }
  }
}
