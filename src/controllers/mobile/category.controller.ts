// src/controllers/public/category.controller.ts
import { Controller, Route, Tags } from "tsoa";
import { CategoryService } from "../../services/mgo-services/categories-service/public/category.public.service";

@Tags("Category")
@Route("/v1/mobile/categories")
export class CategoryController extends Controller {
  private categoryService = new CategoryService();
}
