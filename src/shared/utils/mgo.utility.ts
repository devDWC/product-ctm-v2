import e from "express";
import { CounterModel } from "../../model/entities/counter.entities";

export function buildMongoQuery({
  search,
  searchKeys = [],
  sortList = [],
  defaultSort = { updateDate: -1 },
  baseFilter = {},
  conditions = [],
  keyDenied = [],
}: {
  search?: string;
  searchKeys?: string[];
  sortList?: { key: string; value: "asc" | "desc" }[];
  defaultSort?: Record<string, 1 | -1>;
  baseFilter?: Record<string, any>;
  conditions?: { key: string; value: any }[];
  keyDenied?: string[];
}): { filter: any; sort: any } {
  const filter: any = {};
  const sort: any = {};
  const andConditions: any[] = [];

  // Base filter
  if (Object.keys(baseFilter).length > 0) {
    andConditions.push(baseFilter);
  }

  // Search
  if (search && searchKeys.length > 0) {
    const searchRegex = new RegExp(search.trim(), "i");
    andConditions.push({
      $or: searchKeys.map((key) => ({ [key]: searchRegex })),
    });
  }

  // Conditions
  if (conditions && conditions.length > 0) {
    conditions.forEach(({ key, value }) => {
      if (keyDenied.includes(key)) {
        throw new Error(`Query on key '${key}' is denied`);
      }

      if (Array.isArray(value)) {
        // Nếu value là [min, max] và cả 2 đều là số → hiểu là khoảng giá
        if (value.length === 2 && value.every((v) => typeof v === "number")) {
          andConditions.push({
            [key]: { $gte: value[0], $lte: value[1] },
          });
        } else {
          andConditions.push({ [key]: { $in: value } });
        }
      } else {
        andConditions.push({ [key]: value });
      }
    });
  }

  // Sort
  if (sortList && sortList.length > 0) {
    sortList.forEach(({ key, value }) => {
      if (keyDenied.includes(key)) {
        throw new Error(`Sorting on key '${key}' is denied`);
      }
      sort[key] = value === "asc" ? 1 : -1;
    });
  }

  // Default sort
  if (Object.keys(sort).length === 0 && defaultSort) {
    Object.assign(sort, defaultSort);
  }

  // Merge andConditions vào filter
  if (andConditions.length === 1) {
    Object.assign(filter, andConditions[0]); // chỉ 1 điều kiện → gộp thẳng
  } else if (andConditions.length > 1) {
    filter.$and = andConditions;
  }

  return { filter, sort };
}

export async function generateCode(prefix = "P", minPadLength = 6) {
  try {
    const counter = await CounterModel.findByIdAndUpdate(
      prefix,
      { $inc: { seq: 1 } },
      { upsert: true, new: true }
    );

    const seqString = String(counter.seq);
    const padded =
      seqString.length >= minPadLength
        ? seqString
        : seqString.padStart(minPadLength, "0");

    return `${prefix}${padded}`;
  } catch (err: any) {
    throw new Error("Error generating code: " + err.message);
  }
}

export function buildPagination(
  pageCurrent: number,
  pageSize: number,
  limitPageSize: number
) {
  let limit = pageSize;
  if (pageSize > limitPageSize) {
    limit = limitPageSize;
  }
  const skip = ((pageCurrent || 1) - 1) * limit;
  return { skip, limit };
}
