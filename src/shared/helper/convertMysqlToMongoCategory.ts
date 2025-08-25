import fs from "fs";
import path from "path";

/**
 * Convert file JSON danh mục sang format chuẩn để import vào Mongo
 * @param inputPath Đường dẫn file JSON gốc
 * @param outputPath Đường dẫn file JSON sau khi convert
 */
export function convertCategories(inputPath: string, outputPath: string) {
  try {
    const absoluteInput = path.resolve(inputPath);
    const absoluteOutput = path.resolve(outputPath);

    const data = JSON.parse(fs.readFileSync(absoluteInput, "utf-8"));

    const converted = data.map((item: any) => ({
      ...item,
      categoryId: item.id?.toString() ?? "", // copy id sang categoryId
      parentId: item.parentId?.toString() ?? "0", // ép parentId thành string
      isDeleted: item.isDeleted === 0 ? false : true,
      id: undefined, // bỏ id cũ
    }));

    fs.writeFileSync(absoluteOutput, JSON.stringify(converted, null, 2), "utf-8");
    console.log(`✅ File đã được convert: ${absoluteOutput}`);
  } catch (error) {
    console.error("❌ Lỗi convert:", error);
  }
}
