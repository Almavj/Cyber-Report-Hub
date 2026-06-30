import { randomUUID } from "crypto";
import { extname, basename } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { env } from "../config/env";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/zip",
  "application/x-tar",
  "application/gzip",
];

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

export class InvalidFileTypeError extends Error {
  constructor(mimeType: string) {
    super(`File type "${mimeType}" is not allowed`);
    this.name = "InvalidFileTypeError";
    Object.setPrototypeOf(this, InvalidFileTypeError.prototype);
  }
}

export interface StoredFileMeta {
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

let supabase: SupabaseClient;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    supabase = createClient(env.supabaseUrl, env.supabaseServiceRoleKey);
  }
  return supabase;
}

function sanitizeFileName(fileName: string): string {
  const safe = basename(fileName).replace(/[^a-zA-Z0-9._-]/g, "_");
  if (safe === "." || safe === ".." || safe === "") {
    throw new ObjectNotFoundError();
  }
  return safe;
}

export class ObjectStorageService {
  constructor() {}

  static isAllowedFileType(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType);
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ objectPath: string; meta: StoredFileMeta }> {
    if (!ObjectStorageService.isAllowedFileType(file.mimetype)) {
      throw new InvalidFileTypeError(file.mimetype);
    }

    const ext = extname(file.originalname);
    const objectId = randomUUID();
    const fileName = `${objectId}${ext}`;
    const bucket = env.supabaseStorageBucket;

    const client = getSupabaseClient();
    const { error } = await client.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file to Supabase: ${error.message}`);
    }

    const meta: StoredFileMeta = {
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };

    return { objectPath: `/objects/${fileName}`, meta };
  }

  async getFilePath(objectPath: string): Promise<string> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const rawName = objectPath.slice("/objects/".length);
    const fileName = sanitizeFileName(rawName);
    const bucket = env.supabaseStorageBucket;
    const client = getSupabaseClient();

    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(fileName, 60);

    if (error) {
      throw new ObjectNotFoundError();
    }

    return data.signedUrl;
  }

  async getMetadata(filePath: string): Promise<StoredFileMeta | null> {
    return null;
  }

  async searchPublicObject(
    filePath: string,
  ): Promise<{ filePath: string; meta: StoredFileMeta | null } | null> {
    const rawName = filePath.startsWith("/objects/")
      ? filePath.slice("/objects/".length)
      : filePath;
    const fileName = sanitizeFileName(rawName);
    const bucket = env.supabaseStorageBucket;
    const client = getSupabaseClient();

    const { data, error } = await client.storage
      .from(bucket)
      .createSignedUrl(fileName, 60);

    if (error) {
      return null;
    }

    return { filePath: data.signedUrl, meta: null };
  }

  async listFiles(): Promise<Array<{ name: string; meta: StoredFileMeta }>> {
    const bucket = env.supabaseStorageBucket;
    const client = getSupabaseClient();

    const { data, error } = await client.storage.from(bucket).list("");

    if (error) {
      throw new Error(`Failed to list files from Supabase: ${error.message}`);
    }

    return (data || []).map((file: any) => ({
      name: file.name,
      meta: {
        originalName: file.name,
        contentType: file.metadata?.mimetype || "application/octet-stream",
        size: file.metadata?.size || 0,
        uploadedAt: file.created_at || new Date().toISOString(),
      },
    }));
  }

  async deleteFile(objectPath: string): Promise<void> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }

    const rawName = objectPath.slice("/objects/".length);
    const fileName = sanitizeFileName(rawName);
    const bucket = env.supabaseStorageBucket;
    const client = getSupabaseClient();

    const { error } = await client.storage.from(bucket).remove([fileName]);

    if (error) {
      throw new Error(`Failed to delete file from Supabase: ${error.message}`);
    }
  }
}
