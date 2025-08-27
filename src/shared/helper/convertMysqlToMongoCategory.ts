import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Convert file JSON danh mục sang format chuẩn để import vào Mongo
 * Đồng thời lưu lại mapping id cũ -> categoryId mới để dùng cho Product
 */
export function convertCategories(inputPath: string, outputPath: string, mapPath: string) {
  try {
    const absoluteInput = path.resolve(inputPath);
    const absoluteOutput = path.resolve(outputPath);
    const absoluteMap = path.resolve(mapPath);

    const data = JSON.parse(fs.readFileSync(absoluteInput, "utf-8"));

    // B1: Tạo map id cũ -> categoryId mới (UUID)
    const idToCategoryId: Record<number, string> = {};
    data.forEach((item: any) => {
      idToCategoryId[item.id] = uuidv4();
    });

    // B2: Convert dữ liệu
    const converted = data.map((item: any) => {
      return {
        ...item,
        categoryId: idToCategoryId[item.id],
        parentId: item.parentId === 0 ? "0" : idToCategoryId[item.parentId] ?? "0",
        isDeleted: item.isDeleted === 0 ? false : true,
        id: undefined, // bỏ id cũ
      };
    });

    // B3: Xuất file category
    fs.writeFileSync(absoluteOutput, JSON.stringify(converted, null, 2), "utf-8");

    // B4: Xuất file mapping để dùng cho product
    fs.writeFileSync(absoluteMap, JSON.stringify(idToCategoryId, null, 2), "utf-8");

    console.log(`✅ File category đã được convert: ${absoluteOutput}`);
    console.log(`✅ File mapping đã được lưu: ${absoluteMap}`);
  } catch (error) {
    console.error("❌ Lỗi convert:", error);
  }
}
