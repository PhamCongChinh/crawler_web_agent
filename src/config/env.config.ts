import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
    MONGO_DB_NAME: process.env.MONGO_DB_NAME || "testdb",
    MONGO_COLLECTION_KEYWORD: process.env.MONGO_COLLECTION_KEYWORD,


    PROFILE_ID: process.env.PROFILE_ID || "4e6b81aa-2652-423d-b14e-f720f71b9ceb",
    GPM_URL: process.env.GPM_URL || "http://localhost:16137",
    ORG_ID: process.env.ORG_ID
};
