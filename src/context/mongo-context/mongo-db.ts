import mongoose from "mongoose";

export async function connectToMongoDb(): Promise<void> {
  const mongoUri = process.env.MONGO_DATABASE_URL;
  if (!mongoUri) throw new Error("MONGO_DATABASE_URL is not defined in .env");

  try {
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGO_DB_NAME || "SSODATABASE2",
    });
    console.log("✅ Connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err);
    throw err;
  }
}
