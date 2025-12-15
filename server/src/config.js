export const CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret",
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL || "http://localhost:3000",
  AI_PROVIDER: process.env.AI_PROVIDER || "mock",
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  GOOGLE_VISION_KEY: process.env.GOOGLE_VISION_KEY || "",
  S3_BUCKET: process.env.S3_BUCKET || "",
  S3_REGION: process.env.S3_REGION || "",
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID || "",
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY || ""
};
