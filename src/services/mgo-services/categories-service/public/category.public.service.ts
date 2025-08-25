//src/services/mgo-services/categories-service/public/category.public.service.ts
import { CategoryRepository } from "../../../../repository/mgo-repository/categories-repository/categories.repository";
export class CategoryService {
  private categoryRepo: CategoryRepository;

  constructor() {
    this.categoryRepo = new CategoryRepository();
  }
}
