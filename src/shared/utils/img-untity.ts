/**
 * Tạo URL ảnh sản phẩm theo cấu trúc: [baseUrl]/product/[productCode]/[filename]
 * @param {string} baseUrl - Domain hoặc base URL (ví dụ: https://cdn.chothongminh.com)
 * @param {string} productCode - Mã sản phẩm (ví dụ: P000001)
 * @param {string|string[]} filenames - Tên file (hoặc danh sách file) ảnh (ví dụ: ['a.jpg', 'b.png'])
 * @returns {string|string[]} - Đường dẫn ảnh hoặc mảng đường dẫn ảnh
 */
export function getUrlImgProduct(
  baseUrl: string,
  productCode: string,
  filenames: string | string[]
) {
  if (!baseUrl || !productCode || !filenames) return null;

  const cleanBaseUrl = baseUrl.replace(/\/$/, ""); // remove trailing slash
  const prefixPath = `${cleanBaseUrl}/chothongminh/product/${productCode}`;

  if (Array.isArray(filenames)) {
    return filenames.map((file) => `${prefixPath}/${file}`);
  }

  return `${prefixPath}/${filenames}`;
}
