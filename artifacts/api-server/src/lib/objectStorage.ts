import { randomUUID } from "crypto";
import {
  readdir,
  stat,
  writeFile,
  readFile,
  unlink,
  mkdir,
} from "fs/promises";
import { join, extname } from "path";
import { env } from "../config/env";

export class ObjectNotFoundError extends Error {
  constructor() {
    super("Object not found");
    this.name = "ObjectNotFoundError";
    Object.setPrototypeOf(this, ObjectNotFoundError.prototype);
  }
}

function getUploadDir(): string {
  return join(process.cwd(), env.uploadDir);
}

function getMetadataPath(filePath: string): string {
  return `${filePath}.meta.json`;
}

export interface StoredFileMeta {
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

export class ObjectStorageService {
  constructor() {}

  async ensureUploadDir(): Promise<void> {
    await mkdir(getUploadDir(), { recursive: true });
    await mkdir(join(getUploadDir(), "public"), { recursive: true });
  }

  async saveFile(
    file: Express.Multer.File,
  ): Promise<{ objectPath: string; meta: StoredFileMeta }> {
    await this.ensureUploadDir();

    const ext = extname(file.originalname);
    const objectId = randomUUID();
    const fileName = `${objectId}${ext}`;
    const filePath = join(getUploadDir(), fileName);

    await writeFile(filePath, file.buffer);

    const meta: StoredFileMeta = {
      originalName: file.originalname,
      contentType: file.mimetype,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
    await writeFile(getMetadataPath(filePath), JSON.stringify(meta, null, 2));

    return { objectPath: `/objects/${fileName}`, meta };
  }

  async getFilePath(objectPath: string): Promise<string> {
    if (!objectPath.startsWith("/objects/")) {
      throw new ObjectNotFoundError();
    }
    const fileName = objectPath.slice("/objects/".length);
    const filePath = join(getUploadDir(), fileName);

    try {
      await stat(filePath);
    } catch {
      throw new ObjectNotFoundError();
    }
    return filePath;
  }

  async getMetadata(filePath: string): Promise<StoredFileMeta | null> {
    try {
      const data = await readFile(getMetadataPath(filePath), "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async searchPublicObject(
    filePath: string,
  ): Promise<{ filePath: string; meta: StoredFileMeta | null } | null> {
    const fullPath = join(getUploadDir(), "public", filePath);
    try {
      await stat(fullPath);
      const meta = await this.getMetadata(fullPath);
      return { filePath: fullPath, meta };
    } catch {
      return null;
    }
  }

  async listFiles(): Promise<Array<{ name: string; meta: StoredFileMeta }>> {
    await this.ensureUploadDir();
    const files = await readdir(getUploadDir());
    const result: Array<{ name: string; meta: StoredFileMeta }> = [];

    for (const file of files) {
      if (file.endsWith(".meta.json")) continue;
      const filePath = join(getUploadDir(), file);
      const meta = await this.getMetadata(filePath);
      if (meta) {
        result.push({ name: file, meta });
      }
    }
    return result;
  }

  async deleteFile(objectPath: string): Promise<void> {
    const filePath = await this.getFilePath(objectPath);
    await unlink(filePath);
    try {
      await unlink(getMetadataPath(filePath));
    } catch {
      // metadata may not exist
    }
  }
}
