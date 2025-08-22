// src/locales/index.ts
import vi from "./vi.json";
import en from "./en.json";

const locales: Record<string, Record<string, any>> = { vi, en };

/**
 * Lấy giá trị theo key; hỗ trợ:
 * - direct key: obj["some.key"] (nếu key lưu nguyên)
 * - path key: "a.b.c" -> obj.a.b.c
 */
function getValue(obj: Record<string, any> | undefined, key: string): any {
  if (!obj) return undefined;

  if (Object.prototype.hasOwnProperty.call(obj, key)) return obj[key];

  const parts = key.split(".");
  return parts.reduce((acc: any, p: string) => (acc && acc[p] !== undefined ? acc[p] : undefined), obj);
}

/**
 * Hàm translate t(lang, key, namespace)
 * - lang: raw header value (ví dụ "vi-VN" hoặc "vi")
 * - key: ví dụ "error.product_details_id.required"
 * - namespace: ví dụ "productPromotion"
 */
export function t(rawLang: string | undefined, key: string, namespace?: string): string {
  const lang = (rawLang || "en").split(/[-_]/)[0].toLowerCase(); // normalize "vi-VN" -> "vi"
  const dict = locales[lang] || locales.en;

  // 1) Namespace lookup
  if (namespace) {
    const nsObj = dict[namespace];
    const foundNs = getValue(nsObj, key);
    if (foundNs !== undefined) return foundNs;
  }

  // 2) Global lookup
  const foundGlobal = getValue(dict, key);
  if (foundGlobal !== undefined) return foundGlobal;

  // 3) Fallback: search all namespaces
  for (const nsName of Object.keys(dict)) {
    const nsObj = dict[nsName];
    if (typeof nsObj === "object") {
      const f = getValue(nsObj, key);
      if (f !== undefined) return f;
    }
  }

  // 4) Not found -> trả về key
  return key;
}
