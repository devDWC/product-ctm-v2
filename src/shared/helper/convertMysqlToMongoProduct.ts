import fs from "fs";
import path from "path";

/**
 * Convert file JSON danh mục sang format chuẩn để import vào Mongo
 * @param inputPath Đường dẫn file JSON gốc
 * @param outputPath Đường dẫn file JSON sau khi convert
 */
export function convertProduct(
  inputPath: string,
  outputPath: string,
  mapPath: string
) {
  try {
    const absoluteInput = path.resolve(inputPath);
    const absoluteOutput = path.resolve(outputPath);
    const absoluteMap = path.resolve(mapPath);

    const data = JSON.parse(fs.readFileSync(absoluteInput, "utf-8"));
    const idToCategoryId: Record<string, string> = JSON.parse(
      fs.readFileSync(absoluteMap, "utf-8")
    );

    // B2: Convert dữ liệu
    const converted = data.map((item: any) => {
      return {
        ...item,
        productId: item.id,
        categoryId: idToCategoryId[item.categoryId] ?? item.categoryId,
        id: undefined, // bỏ id cũ
      };
    });

    // B3: Xuất file
    fs.writeFileSync(
      absoluteOutput,
      JSON.stringify(converted, null, 2),
      "utf-8"
    );
    console.log(`✅ File đã được convert: ${absoluteOutput}`);
  } catch (error) {
    console.error("❌ Lỗi convert:", error);
  }
}
