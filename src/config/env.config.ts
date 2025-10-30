import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
    MONGO_DB_NAME: process.env.MONGO_DB_NAME || "testdb",
};
