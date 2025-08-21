import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

export function normalizePhone(
  rawPhone?: string | null,
  defaultCountry: CountryCode = "VN"
): string | null {
  if (!rawPhone) return null;

  const sanitized = rawPhone.replace(/[^\d+]/g, "");
  const phone = parsePhoneNumberFromString(sanitized, defaultCountry);

  if (!phone || !phone.isValid()) return null;

  return phone.number; // E.164 format, e.g. +84395890398
}

export function isValidPhone(
  phone: string,
  country: CountryCode = "VN"
): boolean {
  const clean = phone.replace(/\s+/g, "");
  const parsed = parsePhoneNumberFromString(clean, country);
  return parsed?.isValid() ?? false;
}
