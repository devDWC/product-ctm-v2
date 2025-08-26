export function isNullOrEmpty(value: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}
export function createSlug(input: string) {
  input = input.trim();
  let slug = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  slug = slug
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
  return slug;
}

export function convertToViewGallery(
  data : any,
  baseUrl : string,
  folderPath = "",
  pathExtend = []
) {
  try {
    // Kiểm tra dữ liệu rỗng hoặc null
    if (!data || typeof data !== "string" || data.trim() === "") {
      return [];
    }

    // Kiểm tra xem có phải định dạng JSON hợp lệ không
    const parsedData = JSON.parse(data);

    if (!Array.isArray(parsedData)) {
      console.error("Parsed data is not an array");
      return [];
    }
    const folderPathDefaut = folderPath;
    // Xây dựng mảng đầy đủ với URL
    return parsedData.map((fileName) => {
      if (pathExtend.length > 0) {
        pathExtend.forEach((p) => {
          folderPath = folderPathDefaut + `/${p}`;
        });
      }

      return `${baseUrl}/${folderPath}/${fileName}`;
    });
  } catch (error) {
    console.error("Error in dynamicGalleryBuilder:", error);
    return [];
  }
}
