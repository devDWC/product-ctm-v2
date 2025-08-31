import { IWishlist } from "./../../entities/wishlist.entities";
export class CreateWishListDto {
  /**
   * id người dùng
   * @example "992a5301-4841-4fcd-8c7f-ba31f57bd8b5"
   */
  userId?: string;

  /**
   * id sản phẩm
   * @example "85329595-9f69-4100-a271-c61fbf7b483d"
   */
  productId?: string;
}

export class WishlistDto {
  userId?: string;
  productId?: string;
  customId?: object;
  constructor(data: Partial<IWishlist>) {
    this.customId = {
      mongoId: data._id,
      wishlistId: data.wishlistId,
    };
    this.userId = data.userId || "";
    this.productId = data.productId || "";
  }
}
