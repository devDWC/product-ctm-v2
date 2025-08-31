// src/services/wishlist.service.ts
import { t } from "../../../../locales";
import {
  CreateWishListDto,
  WishlistDto,
} from "../../../../model/dto/wishlist/wishlist.dto";
import { WishlistRepository } from "../../../../repository/mgo-repository/wishlist-repository/wishlist.repository";
import { buildPagination } from "../../../../shared/utils/mgo.utility";
import {
  ConflictError,
  Success,
} from "../../../../shared/utils/response.utility";

export class WishlistService {
  private wishlistRepo: WishlistRepository;

  constructor() {
    this.wishlistRepo = new WishlistRepository();
  }

  // Tạo wishlist
  public async createWishlist(
    wishlist: CreateWishListDto,
    lang: string = "en"
  ) {
    try {
      const res = await this.wishlistRepo.create(wishlist, {
        userId: wishlist.userId,
        product_id: wishlist.productId,
      });

      if (!res) {
        return ConflictError(t(lang, "existing", "wishlist"));
      }
      return Success(
        new WishlistDto(res),
        t(lang, "createSuccess", "wishlist")
      );
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Lấy danh sách wishlist có pagination
  public async getWishListByUserId(
    pageCurrent: number = 1,
    pageSize: number = 10,
    userId: string
  ) {
    try {
      const { skip, limit } = buildPagination(pageCurrent, pageSize, 100);
      const res = await this.wishlistRepo.getMany(
        { userId },
        {},
        { skip, limit, sort: { createDate: -1 } }
      );
      return {
        data: res.data.map((w) => new WishlistDto(w)),
        total: res.total,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Xóa một wishlist
  public async deleteWishlist(wishlist: CreateWishListDto) {
    try {
      const res = await this.wishlistRepo.delete({
        userId: wishlist.userId,
        productId: wishlist.productId,
      });

      if (res) {
        return new WishlistDto(res);
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }
}
