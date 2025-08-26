/**
 * Gán các giá trị từ inputMap vào input, chỉ khi input chưa có giá trị tại key đó.
 * @param {Object} input - Object gốc (sẽ bị sửa đổi trực tiếp)
 * @param {Object} inputMap - Object nguồn dùng để map giá trị
 * @param {string[] | null} includeKeys - (Tùy chọn) Danh sách key cần xét, nếu không truyền sẽ lấy tất cả key từ inputMap
 * @returns {Object} - Object input sau khi đã map
 */
export function autoMap(
  input: any = {},
  inputMap: any = {},
  includeKeys: any = null
) {
  if (typeof input !== "object" || typeof inputMap !== "object") {
    throw new Error("Input và inputMap phải là object");
  }

  const keys = includeKeys || Object.keys(input);

  // for (const key of keys) {
  //   // Chỉ map nếu input có key đó và inputMap cũng có key đó
  //   if (input.hasOwnProperty(key) && inputMap.hasOwnProperty(key)) {
  //     input[key] = inputMap[key];
  //   }
  // }
  for (const key of keys) {
    if (
      Object.prototype.hasOwnProperty.call(input, key) &&
      Object.prototype.hasOwnProperty.call(inputMap, key)
    ) {
      input[key] = inputMap[key];
    }
  }
  return input;
}
export function autoMapWithClass(data: any, ClassRef: any) {
  if (!data) return [];

  // Kiểm tra nếu data là một mảng
  if (Array.isArray(data)) {
    return data.map((item) => {
      const instance = new ClassRef();

      // Lấy giá trị 'products' từ mỗi phần tử trong mảng
      if (item.products) {
        const definedKeys = Object.keys(instance);

        // Map các thuộc tính từ item.products vào instance của ClassRef
        definedKeys.forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(item.products, key)) {
            instance[key] = item.products[key];
          }
        });
      }

      return instance;
    });
  }

  // Nếu không phải mảng, map bình thường
  const instance = new ClassRef();
  const definedKeys = Object.keys(instance);

  definedKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      instance[key] = data[key];
    }
  });

  return instance;
}
