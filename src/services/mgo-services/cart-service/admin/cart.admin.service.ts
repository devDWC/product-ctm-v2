// src/services/cart.service.ts
import { t } from "../../../../locales";
import {
  CreateCartDto,
  CartDto,
  CreateOneCartDto,
} from "../../../../model/dto/cart/cart.dto";
import { ProductDetailsModel } from "../../../../model/entities/product-detail.entities";
import { CartRepository } from "../../../../repository/mgo-repository/cart-repository/cart.repository";
import { buildPagination } from "../../../../shared/utils/mgo.utility";
import { ProductModel } from "../../../../model/entities/product.entities";
import { CartModel } from "../../../../model/entities/cart.entities";

export class CartService {
  private cartRepo: CartRepository;

  constructor() {
    this.cartRepo = new CartRepository();
  }

  // Tạo cart gồm nhiều items
  public async createCartItems(cart: CreateCartDto, lang: string = "en") {
    try {
      const productDetailsIds = cart?.productDetails?.map(
        (item) => item.productDetailId
      );
      if (productDetailsIds) {
        const dataMap = await this.getProductDetailsByIds(productDetailsIds);
        const total = await this.cartRepo.count({
          userId: cart.userId,
        });

        if (total >= 100) {
          return {
            success: false,
            message: t(lang, "overpass", "cart"),
            details: total,
          };
        }

        const checkData = await this.validateAndGetProductDetails(
          cart?.productDetails,
          lang
        );

        if (!checkData.success) {
          return {
            success: false,
            message: checkData.message || t(lang, "inValid", "cart"),
            details: checkData.details || null,
          };
        }

        const productDetailsMap: Record<string, any> = {};
        dataMap.forEach((pd: any) => {
          productDetailsMap[pd.productDetailId] = pd;
        });

        const mergedList = cart?.productDetails?.map((item: any) => {
          const details = productDetailsMap[item.productDetailId] || {};

          return {
            productDetailId: item.productDetailId,
            quantity: item.quantity,

            // Nếu listCart thiếu thì lấy từ details
            productCode: item.productCode || details.productCode || "",
            referenceKey: item.referenceKey || details.referenceKey || "",
            productType: item.productType || details.productType || "",
            tenantId: item.tenantId,
          };
        });

        const productExtendIds = [];
        const productSourceIds = [];
        if (mergedList) {
          for (const item of mergedList) {
            if (item.productType === "product-extend") {
              productExtendIds.push(item.productDetailId);
            } else {
              productSourceIds.push(item.productDetailId);
            }
          }

          // Truy vấn tất cả sản phẩm có sẵn trong giỏ
          const { data: existingCartItems } = await this.cartRepo.getMany({
            userId: cart.userId,
            $or: [
              { productDetailId: { $in: productSourceIds } },
              { product_details_extend_id: { $in: productExtendIds } },
            ],
          });

          const cartMap: Record<string, any> = {};
          for (const item of existingCartItems) {
            const key = item.product_details_extend_id || item.productDetailId;
            cartMap[key] = item;
          }

          const tasks = mergedList.map(async (item: any) => {
            const key = item.product_details_extend_id || item.productDetailId;
            const existingItem = cartMap[key];

            if (item.productType === "product-extend") {
              // Xử lý giống product-extend

              if (existingItem) {
                return this.cartRepo.update(
                  { cartId: existingItem.cartId },
                  { $inc: { quantity: item.quantity } }
                );
              } else {
                return await this.cartRepo.create({
                  userId: cart.userId,
                  quantity: item.quantity,
                  productDetailId: item.productDetailId,
                  tenantId: item.tenantId,
                  product_details_extend_id: item.product_details_id,
                  productCode: item.productCode,
                  referenceKey: item.referenceKey,
                });
              }
            } else {
              // Xử lý giống product-source và product-suggest
              if (existingItem) {
                return this.cartRepo.update(
                  { cartId: existingItem.cartId },
                  { $inc: { quantity: item.quantity } }
                );
              } else {
                return await this.cartRepo.create({
                  userId: cart.userId,
                  quantity: item.quantity,
                  productDetailId: item.productDetailId,
                  tenantId: item.tenantId,
                  productCode: item.productCode,
                  referenceKey: item.referenceKey,
                });
              }
            }
          });

          await Promise.all(tasks);

          // Lấy danh sách cart sau khi update
          const { data, total } = await this.cartRepo.getMany(
            {
              userId: cart.userId,
            },
            { _id: 0, __v: 0 }
          );

          return {
            success: true,
            message: t(lang, "createSuccess", "cart"),
            data: {
              cart: data,
              totalCarts: total,
            },
          };
        }
      }
    } catch (error: any) {
      console.error("error: ", error.message);
      throw new Error(error.message);
    }
  }

  // Tạo cart 1 item
  public async createCartItem(cart: CreateOneCartDto) {
    const cartItem = await this.cartRepo.getOneNotLean({
      userId: cart.userId,
      productDetailId: cart.productDetailId,
    });
    try {
      if (cartItem) {
        cartItem.quantity += cart.quantity || 0;
        cartItem.save();
        return new CartDto(cartItem);
      }
      const res = await this.cartRepo.create({
        userId: cart.userId,
        productDetailId: cart.productDetailId,
        quantity: cart.quantity,
        referenceKey: cart.referenceKey,
        tenantId: cart.tenantId,
        productCode: cart.productCode,
      });
      if (res) {
        return new CartDto(res);
      }
      return null;
    } catch (error: any) {
      console.error(error.message);
      throw new Error(error.message);
    }
  }

  // Lấy danh sách cart của user có pagination
  public async getCartByUserId(
    pageCurrent: number = 1,
    pageSize: number = 10,
    userId: string
  ) {
    try {
      const { skip, limit } = buildPagination(pageCurrent, pageSize, 100);
      const res = await this.cartRepo.getMany(
        { userId },
        {},
        { skip, limit, sort: { createDate: -1 } }
      );
      const data = await this.mapCartWithDetails(res.data);
      return {
        data,
        total: res.total,
      };
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  // Lấy danh sách cart theo cartId
  public async getCartById(cartId: string) {
    const res = await this.cartRepo.getOne({ cartId });
    if (res) {
      const [mapped] = await this.mapCartWithDetails([res]);
      return mapped;
    }
    return null;
  }

  // Cập nhật số lượng theo cartId
  public async updateCart(cartId: string, quantity: number) {
    const cart = await this.cartRepo.getOneNotLean({ cartId });

    if (cart) {
      cart.quantity += quantity;
      cart.save();
      return new CartDto(cart);
    }
    return null;
  }

  // Xóa một item khỏi cart bằng cartId
  public async deleteOneCartItem(cartId: string) {
    const cart = await this.cartRepo.delete({ cartId });

    if (cart) {
      return new CartDto(cart);
    }
    return null;
  }

  // Xóa cart item bằng userId
  public async deleteCartByUserId(userId: string) {
    const { data: carts, total } = await this.cartRepo.getMany({ userId });
    if (total !== 0) {
      return this.cartRepo.deleteMany({ userId });
    }

    return null;
  }

  public async deleteCartByUserAndProductDetailIds(
    userId: string,
    productDetailIds: string[]
  ) {
    const { data: carts, total } = await this.cartRepo.getMany({
      userId,
      productDetailId: { $in: productDetailIds },
    });

    if (total === 0) {
      return 0;
    }

    return await this.cartRepo.deleteMany({
      userId,
      productDetailId: { $in: productDetailIds },
    });
  }

  // Xóa một sản phẩm trong cart
  public async deleteCart(cart: CreateCartDto) {
    try {
      const res = await this.cartRepo.delete({
        userId: cart.userId,
        productDetailId: cart.productDetails,
      });

      if (res) {
        return new CartDto(res);
      }
      return null;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  private async getProductDetailsByIds(productDetailIds: any[]) {
    try {
      // Lấy productDetails có id nằm trong mảng ids
      const products = await ProductDetailsModel.find(
        { productDetailId: { $in: productDetailIds }, isDeleted: false },
        {
          productDetailId: 1,
          productCode: 1,
          referenceKey: 1,
          productType: 1,
        }
      ).lean();
      return products;
    } catch (error) {
      console.error("Error fetching product details:", error);
      throw error;
    }
  }

  private async validateAndGetProductDetails(listCart: any, lang: string) {
    try {
      const productDetailsIds = listCart.map(
        (item: any) => item.productDetailId
      );

      // Lấy danh sách sản phẩm từ MongoDB
      const listProduct = await ProductDetailsModel.find({
        productDetailId: { $in: productDetailsIds },
      }).lean();

      // Lấy danh sách ID hợp lệ từ DB
      const validProductIds = listProduct.map((prod) => prod.productDetailId);

      // Kiểm tra xem có ID nào không tồn tại
      const missingIds = productDetailsIds.filter(
        (id: any) => !validProductIds.includes(id)
      );

      if (missingIds.length > 0) {
        return {
          success: false,
          message: t(lang, "someNotExisting", "cart"),
          details: missingIds,
        };
      }

      // Nếu tất cả hợp lệ, trả lại danh sách sản phẩm
      return {
        success: true,
        message: t(lang, "createSuccess", "cart"),
        details: listProduct,
      };
    } catch (error: any) {
      console.error("Lỗi khi kiểm tra sản phẩm:", error);
      return {
        success: false,
        message: t(lang, "error", "cart"),
        details: error.message,
      };
    }
  }

  private async mapCartWithDetails(carts: any[]) {
    // 1. Lấy danh sách productDetailId trong cart
    const productDetailIds = carts.map((c) => c.productDetailId);

    // 2. Lấy danh sách productDetail
    const productDetails = await ProductDetailsModel.find(
      { productDetailId: { $in: productDetailIds } },
      { _id: 0, __v: 0 }
    ).lean();

    // 3. Lấy tất cả productId từ productDetails
    const productIds = productDetails.map((pd) => pd.productId);
    const products = await ProductModel.find(
      { productId: { $in: productIds } },
      { image_url: 1, productCode: 1, productId: 1, _id: 0 }
    ).lean();

    // 4. Map lại dữ liệu cart + productDetail + product
    return carts.map((c) => {
      const detail = productDetails.find(
        (pd) => pd.productDetailId === c.productDetailId
      );
      const product = detail
        ? products.find((p) => p.productId === detail.productId)
        : null;

      return {
        ...new CartDto(c),
        productDetail: detail || null,
        product: product || null,
      };
    });
  }
}
