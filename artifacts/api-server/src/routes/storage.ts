import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import { ObjectStorageService, ObjectNotFoundError } from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

/**
 * POST /uploads
 * Upload a file via multipart/form-data. Field name: "file"
 */
router.post("/uploads", upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: "No file provided" });
      return;
    }

    const { objectPath, meta } = await objectStorageService.saveFile(file);
    res.json({ objectPath, metadata: meta });
  } catch (error) {
    req.log.error({ err: error }, "Error uploading file");
    res.status(500).json({ error: "Failed to upload file" });
  }
});

/**
 * GET /objects/:fileName
 * Serve an uploaded file by its file name.
 */
router.get("/objects/:fileName", async (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName;
    const objectPath = `/objects/${fileName}`;
    const filePath = await objectStorageService.getFilePath(objectPath);
    const meta = await objectStorageService.getMetadata(filePath);

    const contentType = meta?.contentType || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "private, max-age=3600");
    if (meta?.size) {
      res.setHeader("Content-Length", String(meta.size));
    }

    res.sendFile(filePath);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

/**
 * DELETE /objects/:fileName
 * Delete an uploaded file.
 */
router.delete("/objects/:fileName", async (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName;
    await objectStorageService.deleteFile(`/objects/${fileName}`);
    res.status(204).end();
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error deleting object");
    res.status(500).json({ error: "Failed to delete object" });
  }
});

/**
 * GET /files
 * List all uploaded files.
 */
router.get("/files", async (_req: Request, res: Response) => {
  try {
    const files = await objectStorageService.listFiles();
    res.json(files);
  } catch (error) {
    _req.log.error({ err: error }, "Error listing files");
    res.status(500).json({ error: "Failed to list files" });
  }
});

export default router;
