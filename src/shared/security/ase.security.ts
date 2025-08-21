// src/utils/aes.security.ts

import CryptoJS from "crypto-js";
import cryptoJS from "crypto";
const encryptActive = true; // Cho bật/tắt mã hóa
const secretKey = process.env.AES_SECRET_KEY || "your-secret-key";

// ====== Classes ======

export class EncryptInput {
  encryptdata: any;
  timeStamp: number;

  constructor(data: any) {
    this.encryptdata = data;
    this.timeStamp = Date.now(); // milliseconds
  }
}

export class EncryptOutput {
  decryptdata: any;
  timeStamp: number | null;

  constructor(data: any) {
    try {
      const parsed = typeof data === "string" ? JSON.parse(data) : data;
      this.decryptdata = parsed.encryptdata ?? parsed.decryptdata ?? null;
      this.timeStamp = parsed.timeStamp ?? null;
    } catch (err) {
      // Dữ liệu không phải JSON
      this.decryptdata = data;
      this.timeStamp = null;
    }
  }
}

// ====== Utility ======

export function generatePrivateKey(): string {
  return CryptoJS.lib.WordArray.random(16).toString(); // Random 128-bit key
}

// ====== Main methods ======

export function encryptAESwithTime(data: any): string {
  if (!encryptActive) return data;

  const dataToEncrypt = data ?? generatePrivateKey();
  const input = new EncryptInput(dataToEncrypt);
  const encrypted = CryptoJS.AES.encrypt(
    JSON.stringify(input),
    secretKey
  ).toString();

  return encrypted;
}

export function decryptAESwithTime(encryptedData: string): any {
  if (!encryptActive) return encryptedData;

  let decryptedStr: string;
  try {
    decryptedStr = CryptoJS.AES.decrypt(encryptedData, secretKey).toString(
      CryptoJS.enc.Utf8
    );
  } catch (error) {
    throw new Error("Failed to decrypt data.");
  }

  let parsed: EncryptOutput;
  try {
    parsed = new EncryptOutput(decryptedStr);
  } catch {
    throw new Error("Invalid decrypted data format.");
  }

  const now = Date.now();
  const maxValidDuration = 3 * 60 * 1000; // 3 phút

  const timeStamp = Number(parsed.timeStamp);

  if (!timeStamp || isNaN(timeStamp)) {
    throw new Error("Missing or invalid timestamp.");
  }

  if (now - timeStamp > maxValidDuration) {
    throw new Error("Decrypted data has expired (older than 3 minutes).");
  }

  return parsed.decryptdata;
}

/**
 * Mã hóa RSA với OAEP-SHA256
 * @param {any} input - Dữ liệu đầu vào để mã hóa
 * @param {string} publicKeyPem - Public key ở định dạng PEM
 * @returns {string} - Chuỗi base64 đã mã hóa
 */
export function encryptRsa(input: string, publicKeyPem: string) {
  const payload = {
    timestamp: Date.now(),
    data: input ?? "Success",
  };

  const json = JSON.stringify(payload);
  const buffer = Buffer.from(json, "utf8");

  const encrypted = cryptoJS.publicEncrypt(
    {
      key: publicKeyPem,
      padding: cryptoJS.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    buffer
  );

  return encrypted.toString("base64");
}

export function decryptAES(decryptdata: string): string {
  if (!encryptActive) return decryptdata;

  // Giải mã AES
  const bytes = CryptoJS.AES.decrypt(decryptdata, secretKey);
  const decryptedString = bytes.toString(CryptoJS.enc.Utf8);

  if (!decryptedString) {
    throw new Error("Decryption failed or invalid ciphertext");
  }

  // Tạo đối tượng từ chuỗi đã giải mã
  const finishData = new EncryptOutput(decryptedString);

  // Nếu có timeStamp thì kiểm tra hạn
  if (finishData.timeStamp) {
    const now = Date.now();
    const timeDiff = now - Number(finishData.timeStamp);
    const maxValidDuration = 5 * 60 * 1000; // 5 phút

    if (timeDiff > maxValidDuration) {
      throw new Error("timestamp err");
    }
  }

  return finishData.decryptdata;
}
