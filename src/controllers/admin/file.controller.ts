import { Controller, Route, Tags, Post, UploadedFile, UploadedFiles, Body, Query, Header } from "tsoa";

import { t } from "../../locales";
import { ExceptionError, Success } from "../../shared/utils/response.utility";
import { S3Service } from "../../services/helper-services/s3.service";



@Tags("Upload")
@Route("/v1/admin/upload")
export class UploadController extends Controller {
  
  /**
   * Upload single file
   */
  private readonly _s3Service = new S3Service();

  @Post("/single")
  public async uploadSingle(
    @UploadedFile() file: Express.Multer.File, // tsoa hỗ trợ decorator này
    @Query() folderPath: string,
    @Query() distinctive: string,
    @Header("Accept-Language") lang?: string
  ): Promise<any> {
    try {
      if (!file) {
        return ExceptionError(t(lang, "noFileProvided", "upload"));
      }

      const result = await this._s3Service.uploadSingleFileAsync(file, folderPath, distinctive);
      return Success(result, t(lang, "uploadSuccess", "upload"));
    } catch (error: any) {
      return ExceptionError(error?.message || t(lang, "uploadFailure", "upload"));
    }
  }

  /**
   * Upload multiple files
   */
  @Post("/multiple")
  public async uploadMultiple(
    @UploadedFiles() files: Express.Multer.File[],
    @Query() folderPath: string,
    @Query() distinctive: string,
    @Header("Accept-Language") lang?: string
  ): Promise<any> {
    try {
      if (!files || files.length === 0) {
        return ExceptionError(t(lang, "noFilesProvided", "upload"));
      }

      const result = await this._s3Service.uploadMultipleFilesAsync(files, folderPath, distinctive);
      return Success(result, t(lang, "uploadSuccess", "upload"));
    } catch (error: any) {
      return ExceptionError(error?.message || t(lang, "uploadFailure", "upload"));
    }
  }
}
