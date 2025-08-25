import * as Sentry from "@sentry/node";


Sentry.init({
  dsn: "https://c052f03c5a0db4e7635b8ed752015312@o4509902576484352.ingest.de.sentry.io/4509902753824848", // thay DSN thật
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV || "development",
});

export class LogService {
  info(message: string, context?: any) {
    console.log(`[INFO] ${message}`, context || "");
  }

  warn(message: string, context?: any) {
    console.warn(`[WARN] ${message}`, context || "");
  }

  error(error: Error | string, context?: any) {
    if (typeof error === "string") {
      console.error(`[ERROR] ${error}`, context || "");
      try {
              Sentry.captureMessage(error);
      } catch (error) {
        
      }

    } else {
      console.error(`[ERROR] ${error.message}`, error.stack, context || "");
      Sentry.captureException(error);
    }
  }
}

// Singleton export
// Tạo instance log service (singleton)
export const  _logSingletonService = new LogService();

