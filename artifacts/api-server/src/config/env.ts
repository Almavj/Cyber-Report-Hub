const requiredEnv = ["PORT"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} environment variable is required.`);
  }
}

export const env = {
  port: Number(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL ?? "",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? "",
};
