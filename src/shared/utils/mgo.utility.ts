function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // escape regex special chars
}

export function buildMongoQuery({
  search,
  searchKeys = [],
  sortList = [],
  defaultSort = { updateDate: -1 },
  baseFilter = {},
  conditions = [],
}: any): any {
  const filter: any = {};
  const sort: any = {};
  const andConditions: any[] = [];

  // Base filter (ví dụ: { status: 'A' })
  if (Object.keys(baseFilter).length > 0) {
    andConditions.push(baseFilter);
  }

  // Xử lý tìm kiếm
  if (search && searchKeys.length > 0) {
    const searchRegex = new RegExp(search, "i");
    andConditions.push({
      $or: searchKeys.map((key: string) => ({ [key]: searchRegex })),
    });
  }

  // Áp dụng conditions cụ thể
  if (conditions.length > 0) {
    conditions.forEach(({ key, value }: any) => {
      andConditions.push({ [key]: value });
    });
  }

  // Phân tích sortList
  if (sortList && sortList.length > 0) {
    sortList.forEach(({ key, value }: any) => {
      if (value === "asc" || value === "desc") {
        sort[key] = value === "asc" ? 1 : -1;
      } else {
        andConditions.push({ [key]: value });
      }
    });
  }

  // Sort mặc định nếu chưa có
  if (Object.keys(sort).length === 0 && defaultSort) {
    Object.assign(sort, defaultSort);
  }

  // Nếu có điều kiện thì thêm vào filter
  if (andConditions.length > 0) {
    filter.$and = andConditions;
  }

  return { filter, sort };
}
