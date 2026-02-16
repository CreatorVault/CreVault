import app from "./app";
import { connectDB } from "./config/db";

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
    await connectDB();
    return app(req, res);
}
