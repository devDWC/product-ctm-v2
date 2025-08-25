import { s3Utility } from "ctm-utility";

export class S3Service {
  public async uploadMultipleFilesAsync(
    files: any,
    folderPath: string,
    distinctive: string,
    organization: string = "chothongminh"
  ) {
    const pathToSave = `${folderPath}/${distinctive}`;
    return await s3Utility.uploadMultipleFilesAsync(
      files,
      pathToSave,
      organization
    );
  }

  public async uploadFilesJoinInFolderAsync(
    files: any,
    folderPath: string,
    distinctive: string,
    organization: string = "chothongminh"
  ) {
    const pathToSave = `${folderPath}/${distinctive}`;
    return await s3Utility.uploadFilesJoinInFolderAsync(
      files,
      pathToSave,
      organization
    );
  }

  public async uploadSingleFileAsync(
    file: any,
    folderPath: string,
    distinctive: string,
    organization: string = "chothongminh"
  ) {
    if (!file) return undefined;

    const pathToSave = `${folderPath}/${distinctive}`;
    try {
      return await s3Utility.uploadSingleFileAsync(
        [file],
        pathToSave,
        organization
      );
    } catch (error) {
      return undefined;
    }
  }

  public async deleteFolder(
    folderPath: string,
    distinctive: string,
    organization: string = "chothongminh"
  ) {
    const pathToSave = `${folderPath}/${distinctive}`;
    return await s3Utility.deleteFolderAsync(pathToSave, organization);
  }
}
