import mongoose from "mongoose";

export class MongoConnection {
	private static instance: MongoConnection;
	private isConnected = false;

	private constructor() {}

	public static getInstance(): MongoConnection {
		if (!MongoConnection.instance) {
		MongoConnection.instance = new MongoConnection();
		}
		return MongoConnection.instance;
	}

	public async connect(uri: string): Promise<void> {
		if (this.isConnected) {
		console.log("✅ MongoDB already connected");
		return;
		}

		try {
		await mongoose.connect(uri);
		this.isConnected = true;
		console.log("✅ Connected to MongoDB");
		} catch (error) {
		console.error("❌ MongoDB connection error:", error);
		process.exit(1);
		}
	}

	public async disconnect(): Promise<void> {
		if (!this.isConnected) return;
		await mongoose.disconnect();
		this.isConnected = false;
		console.log("🛑 MongoDB disconnected");
	}
}
