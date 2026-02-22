import mongoose from "mongoose";
import dns from "dns";

// Node.js 24.13.x has a regression on Windows where SRV DNS lookups fail.
// Explicitly setting public DNS servers (Google + Cloudflare) fixes this.
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

export const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed", error);
    process.exit(1);
  }
};
