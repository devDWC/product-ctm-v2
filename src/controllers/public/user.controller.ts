import { Route, Tags, Controller, Get, Query, Put, Body, Path } from "tsoa";
import { ApiResponse } from "../../model/base/response.dto";
import {
  Success,
  ExceptionError,
  NotfoundError,
  ProcessError,
} from "../../shared/utils/response.utility";
import {
  updateDynamicUser,
  getListAddressUserById,
  getUserByIdPublic,
  findUserWithEmailOrPhone,
  updateLatvsLngUser,
  updateEmailOrPhoneNumber,
  getUsersForComment,
} from "../../service/mgo-services/users-service/public/user.service";
import {
  UpdateUserDto,
  UpdateLocationDto,
  InputupdateEmailOrPhoneDto,
} from "../../model/dto/user/user.dto";

@Route("v1/public/users")
@Tags("Users")
export class UserController extends Controller {
  @Put("/updateDynamicUser/{id}")
  public async updateDynamicUser(
    @Path() id: string,
    @Body() body: UpdateUserDto
  ): Promise<ApiResponse> {
    try {
      const result = await updateDynamicUser(id, body);
      return Success(result, "Cập nhật người dùng thành công");
    } catch (error: any) {
      return ExceptionError(error?.message || "Lỗi khi cập nhật người dùng");
    }
  }

  @Get("/getListAddressUserById/{id}")
  public async getListAddressUserById(
    @Path() id: string
  ): Promise<ApiResponse> {
    try {
      const result = await getListAddressUserById(id);
      if (!result) return NotfoundError("Người dùng không tồn tại");
      return Success(result, "Lấy địa chỉ người dùng thành công");
    } catch (error: any) {
      return ExceptionError(error?.message || "Lỗi khi lấy địa chỉ người dùng");
    }
  }

  @Get("/{id}")
  public async getUserByIdPublic(@Path() id: string): Promise<ApiResponse> {
    try {
      const result = await getUserByIdPublic(id);
      if (!result) return NotfoundError("Người dùng không tồn tại");
      return Success(result, "Lấy thông tin người dùng thành công");
    } catch (error: any) {
      return ExceptionError(
        error?.message || "Lỗi khi lấy thông tin người dùng"
      );
    }
  }

  @Get("/findUserWithEmailOrPhone")
  public async findUserWithEmailOrPhone(
    @Query() emailAddress?: string,
    @Query() phoneNumber?: string
  ): Promise<ApiResponse> {
    try {
      const result = await findUserWithEmailOrPhone({
        emailAddress,
        phoneNumber,
      });
      if (!result) return NotfoundError("Người dùng không tồn tại");
      return Success(result, "Tìm người dùng thành công");
    } catch (error: any) {
      return ExceptionError(error?.message || "Lỗi khi tìm người dùng");
    }
  }

  @Put("/updateLatvsLngUser/{id}")
  public async updateLatvsLngUser(
    @Path() id: string,
    @Body() body: UpdateLocationDto
  ): Promise<ApiResponse> {
    try {
      const result = await updateLatvsLngUser(id, body.lng, body.lat);
      return result
        ? Success(result, "Cập nhật vị trí thành công")
        : ProcessError();
    } catch (error: any) {
      return ExceptionError(error?.message || "Lỗi khi cập nhật vị trí");
    }
  }

  @Put("/updateEmailOrPhoneNumber/{id}")
  public async updateEmailOrPhoneNumber(
    @Path() id: string,
    @Body() body: InputupdateEmailOrPhoneDto
  ): Promise<ApiResponse> {
    try {
      const result = await updateEmailOrPhoneNumber(
        id,
        body.otp,
        body.phoneNumber,
        body.emailAddress
      );
      if (!result)
        return NotfoundError("Không tìm thấy người dùng để cập nhật");
      return Success(result, "Cập nhật thông tin liên hệ thành công");
    } catch (error: any) {
      return ExceptionError(
        error?.message || "Lỗi khi cập nhật thông tin liên hệ"
      );
    }
  }

  @Get("/getUsersForComment")
  public async getUsersForComment(
    @Query() search?: string,
    @Query() pageCurrent?: number,
    @Query() pageSize?: number,
    @Query() sortList?: string
  ): Promise<ApiResponse> {
    try {
      const result = await getUsersForComment(
        search,
        pageCurrent,
        pageSize,
        sortList
      );
      if (!result) return NotfoundError("Người dùng không tồn tại");
      return Success(result, "Lấy danh sách người dùng cho comment thành công");
    } catch (error: any) {
      return ExceptionError(
        error?.message || "Lỗi khi lấy danh sách người dùng cho comment"
      );
    }
  }
}
