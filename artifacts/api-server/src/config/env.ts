const requiredEnv = ["PORT", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_STORAGE_BUCKET"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`${key} environment variable is required.`);
  }
}

export const env = {
  port: Number(process.env.PORT),
  databaseUrl: process.env.DATABASE_URL ?? "",
  allowedOrigins: process.env.ALLOWED_ORIGINS ?? "",
  supabaseUrl: process.env.SUPABASE_URL!,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET!,
};
