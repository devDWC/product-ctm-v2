import { v4 as uuidv4 } from "uuid";
export function generatePrivateKey() {
  return uuidv4();
}

/**
 * Parse JSON một cách an toàn và đệ quy (deep), để xử lý các trường hợp JSON lồng nhau.
 * @param value Chuỗi JSON hoặc object
 * @returns Object đã parse, hoặc giá trị ban đầu nếu không parse được
 */
export function safeParseJSONDeep(value: any): any {
  try {
    if (typeof value === "string") {
      const parsed = JSON.parse(value);
      return safeParseJSONDeep(parsed);
    }

    if (typeof value === "object" && value !== null) {
      for (const key in value) {
        value[key] = safeParseJSONDeep(value[key]);
      }
    }

    return value;
  } catch (error) {
    return value; // Trả lại nguyên bản nếu không parse được
  }
}
