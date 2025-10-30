import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize, errors, json } = format;

// Custom log format cho console
const consoleFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: "info", // mức log tối thiểu
  format: combine(
    errors({ stack: true }), // in stack trace nếu có lỗi
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    json() // format json cho file
  ),
  transports: [
    // Log ra console
    new transports.Console({
      format: combine(colorize(), timestamp(), consoleFormat),
    }),
    // Log ra file info
    new transports.File({ filename: "logs/app.log", level: "info" }),
    // Log lỗi riêng
    new transports.File({ filename: "logs/error.log", level: "error" }),
  ],
  exitOnError: false, // không thoát app khi log lỗi
});

export default logger;
