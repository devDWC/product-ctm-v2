import { Controller, Route, Tags } from "tsoa";

import { CategoryService } from "../../services/mgo-services/categories-service/public/category.public.service";

@Tags("Category")
@Route("/v1/public/categories")
export class CategoryController extends Controller {

}
