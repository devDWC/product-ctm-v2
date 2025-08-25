//src/services/mgo-services/product-service/admin/product.admin.service.ts
import { InputQuery } from "../../../../model/base/input-query.dto";
import { ProductDto } from "../../../../model/dto/product/product.dto";
import { IProduct } from "../../../../model/entities/product.entities";
import { ProductRepository } from "../../../../repository/mgo-repository/product-repository/product.repository";
import { buildMongoQuery } from "../../../../shared/utils/mgo.utility";

export class ProductService {
  private productRepo: ProductRepository;

  constructor() {
    this.productRepo = new ProductRepository();
  }

    /**
     * Lấy danh sách tất cả products
     */
    public async getAllProducts(option: InputQuery): Promise<{
      data: ProductDto[];
      total: number;
    }> {
      const mongoBuild = {
        search: option.search,
        searchKeys: ["name", "slug"],
        sortList: option.sortList,
        conditions: option.conditions,
        baseFilter: { isDeleted: false },
      };
  
      const { filter, sort } = buildMongoQuery(mongoBuild);
  
      const skip = ((option.pageCurrent || 1) - 1) * (option.pageSize || 10);
      const limit = option.pageSize || 10;
  
      const { data, total } = await this.productRepo.getMany(filter, null, {
        sort,
        skip,
        limit,
      });
  
      const mapped = data.map((c: IProduct) => new ProductDto(c));
      return { data: mapped, total };
    }
  
    /**
     * Lấy product theo productId
     */
    public async getProductById(
      categoryId: string
    ): Promise<ProductDto | null> {
      const category = await this.productRepo.getOne({
        categoryId,
        isDeleted: false,
      });
      return category ? new ProductDto(category) : null;
    }
}
