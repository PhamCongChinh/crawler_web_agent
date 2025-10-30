import mongoose from "mongoose";
import { envConfig } from "../config/env.config.js";

export class MongoConnection {
  private static instance: MongoConnection;
  private isConnected = false;
  private retryCount = 0;
  private readonly maxRetries = 5;
  private readonly retryDelay = 3000; // ms

  private constructor() {}

  public static getInstance(): MongoConnection {
    if (!MongoConnection.instance) {
      MongoConnection.instance = new MongoConnection();
    }
    return MongoConnection.instance;
  }

  public async connect(): Promise<typeof mongoose> {
    if (this.isConnected) {
      console.log("✅ MongoDB đã kết nối rồi.");
      return mongoose;
    }

    const uri = envConfig.MONGO_URI;
    const dbName = envConfig.MONGO_DB_NAME;

    while (this.retryCount < this.maxRetries) {
      try {
        console.log(`🔌 Đang kết nối MongoDB (lần ${this.retryCount + 1})...`);
        await mongoose.connect(uri, { dbName });
        this.isConnected = true;
        console.log(`✅ Kết nối MongoDB thành công: ${dbName}`);
        return mongoose;
      } catch (err) {
        this.retryCount++;
        console.error(`❌ Lỗi kết nối MongoDB: ${err}`);
        if (this.retryCount < this.maxRetries) {
          console.log(`🔁 Thử lại sau ${this.retryDelay / 1000}s...`);
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        } else {
          throw new Error("❌ Không thể kết nối MongoDB sau nhiều lần thử.");
        }
      }
    }

    throw new Error("❌ Kết nối MongoDB thất bại.");
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log("🔌 Ngắt kết nối MongoDB.");
    }
  }
}
