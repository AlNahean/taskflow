import pino from "pino";

const isDevelopment = process.env.NODE_ENV === "development";

// --- SERVER-SIDE LOGGER (PINO) ---
const serverLogger = pino({
  level: isDevelopment ? "info" : "error",
});

// --- CLIENT-SIDE LOGGER (LIGHTWEIGHT WRAPPER) ---
type LogLevel = "info" | "warn" | "error";
type LogData = { [key: string]: any };

const formatClientMessage = (
  level: LogLevel,
  context: string,
  message: string,
  data?: LogData
) => {
  const logEntry = {
    context,
    message,
    ...data,
  };
  const style = `color: ${
    level === "error" ? "red" : level === "warn" ? "orange" : "blue"
  }; font-weight: bold;`;

  console[level](`%c[${context}]`, style, message, logEntry);
};

const createClientLogger = (context: string) => ({
  info: (message: string, data?: LogData) => {
    if (isDevelopment) {
      formatClientMessage("info", context, message, data);
    }
  },
  warn: (message: string, data?: LogData) => {
    formatClientMessage("warn", context, message, data);
  },
  error: (message: string, data?: LogData) => {
    formatClientMessage("error", context, message, data);
  },
});

export { serverLogger, createClientLogger };
