import * as Sentry from "@sentry/node";
import baseConfig from "../../config/baseConfig.json";
import { ErrorLog } from "../../model/enum/error-log.enum";

Sentry.init({
  dsn: "https://c052f03c5a0db4e7635b8ed752015312@o4509902576484352.ingest.de.sentry.io/4509902753824848", // thay DSN thật
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
});

export class LogService {
  private isEnabled: boolean;

  constructor() {
    // true = bật log, false = tắt log
    this.isEnabled = baseConfig.logService;
  }

  info(message: string, context?: any) {
    if (!this.isEnabled) return;
    console.log(`[INFO] ${message}`, context || "");
  }

  warn(message: string, context?: any) {
    if (!this.isEnabled) return;
    console.warn(`[WARN] ${message}`, context || "");
  }

  error(error: Error | string, context?: any) {
    if (!this.isEnabled) return;

    if (typeof error === "string") {
      console.error(`[ERROR] ${error}`, context || "");
      Sentry.captureMessage(error);
    } else {
      console.error(`[ERROR] ${error.message}`, error.stack, context || "");
      Sentry.captureException(error);
    }
  }

  businessErrorLog(controller: string, error: string, context?: any) {
    const errorLog = `[${controller}]-[${ErrorLog.BUSINESS}]: ${error}`;
    console.error(`${errorLog}, ${context}`);
    Sentry.captureMessage(errorLog);
  }

  exceptionErrorLog(controller: string, error: string, context?: any) {
    const errorLog = `[${controller}]-[${ErrorLog.EXCEPTION}]: ${error}`;
    console.error(`${errorLog}, ${context}`);
    Sentry.captureException(error);
  }
}

// Singleton export
// Tạo instance log service (singleton)
export const _logSingletonService = new LogService();
