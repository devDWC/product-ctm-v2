export interface InputQuery {
  search?: string;
  pageCurrent : number;
  pageSize: number;
  sortList?: { key: string; value: "asc" | "desc" }[];
  conditions?: {
    key: string;
    value: string | number | (string | number)[];
  }[];
}

export class InputQueryCleaner {
  static clean(input: Partial<InputQuery>): InputQuery {
    return {
      search: typeof input.search === "string" ? input.search.trim() : undefined,

      pageCurrent:
        typeof input.pageCurrent === "number" && input.pageCurrent > 0
          ? input.pageCurrent
          : 1,

      pageSize:
        typeof input.pageSize === "number" && input.pageSize > 0
          ? input.pageSize
          : 10,

      sortList: Array.isArray(input.sortList)
        ? input.sortList
            .filter(
              (s) =>
                s &&
                typeof s.key === "string" &&
                (s.value === "asc" || s.value === "desc")
            )
            .map((s) => ({
              key: s.key.trim(),
              value: s.value,
            }))
        : [],

      conditions: Array.isArray(input.conditions)
        ? input.conditions.filter(
            (c) =>
              c &&
              typeof c.key === "string" &&
              (typeof c.value === "string" ||
                typeof c.value === "number" ||
                (Array.isArray(c.value) &&
                  c.value.every(
                    (v) => typeof v === "string" || typeof v === "number"
                  )))
          )
        : [],
    };
  }
}