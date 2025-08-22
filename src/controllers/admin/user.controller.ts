import {
  Body,
  Controller,
  Get,
  Middlewares,
  Post,
  Query,
  Route,
  Tags,
  Path,
  Put,
} from "tsoa";
import { ExceptionError, Success } from "../../shared/utils/response.utility";
import { ApiResponse } from "../../model/base/response.dto";
import {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  exchangePointUser,
  getUserStatsThisMonth,
} from "../../service/mgo-services/users-service/admin/user.service";
import {
  CreateUserDto,
  UpdateUserDto,
  GetUserRequest,
} from "../../model/dto/user/user.dto";

// sửa path import middleware đúng
import { accessControlMiddleware } from "../../middleware/access-control.middleware";
import { ExchangePointDto } from "../../model/dto/user/pointUser.dto";

@Tags("User")
@Route("/v1/admin/users")
export class UserController extends Controller {
  @Post("/getUser")
  // giữ nguyên comment middleware
  // @Middlewares([accessControlMiddleware("account", "GET_ACCOUNT")])
  public async getUserList(@Body() body: GetUserRequest): Promise<ApiResponse> {
    try {
      const {
        search = "",
        pageCurrent = 1,
        pageSize = 5,
        sortList = [],
      } = body;

      const response = await getUsers(
        search,
        Number(pageCurrent),
        Number(pageSize),
        sortList
      );

      return Success(response, "Lấy danh sách employed thành công");
    } catch (error) {
      this.setStatus(500);
      return ExceptionError("Lỗi khi lấy danh sách employed");
    }
  }

  @Get("/")
  public async getUsers(
    @Query() search?: string,
    @Query() pageCurrent: number = 1,
    @Query() pageSize: number = 10,
    @Query() sortList?: string // dạng JSON string như: '[{"key":"emailAddress","value":"asc"}]'
  ): Promise<ApiResponse> {
    let parsedSortList: any[] = [];

    if (sortList) {
      try {
        parsedSortList = JSON.parse(sortList);
      } catch (error) {
        console.warn("Invalid sortList format. Must be JSON string.");
      }
    }

    const result = await getUsers(
      search || "",
      pageCurrent,
      pageSize,
      parsedSortList
    );

    return Success(result, "Lấy danh sách người dùng thành công");
  }

  // dùng middleware chuẩn, factory trả về function
  @Middlewares([accessControlMiddleware("users", "create")])
  @Post("/")
  public async createUser(@Body() user: CreateUserDto): Promise<ApiResponse> {
    try {
      const newUser = await createUser(user);
      return Success(newUser, "Tạo người dùng thành công");
    } catch (error: any) {
      const message = error?.message || "Đã xảy ra lỗi không xác định";
      return ExceptionError(message);
    }
  }

  @Get("{id}")
  public async getUserById(@Path() id: string): Promise<ApiResponse> {
    try {
      const user = await getUserById(id);
      return Success(user, "Lấy thông tin người dùng thành công");
    } catch (error: any) {
      const message = error?.message || "Đã xảy ra lỗi không xác định";
      return ExceptionError(message);
    }
  }

  @Put("{id}")
  public async updateUser(
    @Path() id: string,
    @Body() user: UpdateUserDto
  ): Promise<ApiResponse> {
    try {
      const updated = await updateUser(id, user);
      return Success(updated, "Cập nhật người dùng thành công");
    } catch (error: any) {
      const message = error?.message || "Đã xảy ra lỗi không xác định";
      return ExceptionError(message);
    }
  }

  @Put("exchangePointUser/{id}")
  public async exchangePointUser(
    @Path() id: string,
    @Body() user: ExchangePointDto
  ): Promise<ApiResponse> {
    try {
      const updated = await exchangePointUser(id, user);
      return Success(updated, "Cập nhật người dùng thành công");
    } catch (error: any) {
      const message = error?.message || "Đã xảy ra lỗi không xác định";
      return ExceptionError(message);
    }
  }

  @Get("getUserStatsThisMonth/getTotal")
  public async getUserStatsThisMonth(
    @Query() tenantId?: number
  ): Promise<ApiResponse> {
    try {
      const updated = await getUserStatsThisMonth(tenantId);
      return Success(updated, "Lấy thông tin thống kê thành công");
    } catch (error: any) {
      const message = error?.message || "Đã xảy ra lỗi không xác định";
      return ExceptionError(message);
    }
  }
}
