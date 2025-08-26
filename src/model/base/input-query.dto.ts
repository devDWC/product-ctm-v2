export interface InputQuery {
  search?: string;
  pageCurrent?: number;
  pageSize?: number;
  sortList?: { key: string; value: "asc" | "desc" }[];
  conditions?: {
    key: string;
    value: string | number | (string | number)[];
  }[];
}
