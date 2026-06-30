import { Router, type IRouter, type Request, type Response } from "express";
import multer from "multer";
import {
  ObjectStorageService,
  ObjectNotFoundError,
  InvalidFileTypeError,
} from "../lib/objectStorage";

const router: IRouter = Router();
const objectStorageService = new ObjectStorageService();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ObjectStorageService.isAllowedFileType(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new InvalidFileTypeError(file.mimetype));
    }
  },
});

const uploadLimiter = (() => {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const WINDOW_MS = 60_000;
  const MAX_REQUESTS = 10;

  return (req: Request, res: Response, next: Function) => {
    const ip = req.ip || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const entry = hits.get(ip);

    if (!entry || now > entry.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return next();
    }

    entry.count++;
    if (entry.count > MAX_REQUESTS) {
      res.setHeader("Retry-After", String(Math.ceil((entry.resetAt - now) / 1000)));
      res.status(429).json({ error: "Too many upload requests. Try again later." });
      return;
    }

    next();
  };
})();

function requireAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authorization required" });
    return;
  }
  next();
}

router.post(
  "/uploads",
  requireAuth,
  uploadLimiter,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const { objectPath, meta } = await objectStorageService.saveFile(file);
      res.json({ objectPath, metadata: meta });
    } catch (error) {
      if (error instanceof InvalidFileTypeError) {
        res.status(400).json({ error: error.message });
        return;
      }
      req.log.error({ err: error }, "Error uploading file");
      res.status(500).json({ error: "Failed to upload file" });
    }
  },
);

router.get("/objects/:fileName", async (req: Request, res: Response) => {
  try {
    const fileName = req.params.fileName;
    const objectPath = `/objects/${fileName}`;
    const signedUrl = await objectStorageService.getFilePath(objectPath);

    res.redirect(signedUrl);
  } catch (error) {
    if (error instanceof ObjectNotFoundError) {
      res.status(404).json({ error: "Object not found" });
      return;
    }
    req.log.error({ err: error }, "Error serving object");
    res.status(500).json({ error: "Failed to serve object" });
  }
});

router.delete("/objects/:fileName", requireAuth, async (req: Request, res: Response) => {
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

router.get("/files", requireAuth, async (_req: Request, res: Response) => {
  try {
    const files = await objectStorageService.listFiles();
    res.json(files);
  } catch (error) {
    _req.log.error({ err: error }, "Error listing files");
    res.status(500).json({ error: "Failed to list files" });
  }
});

export default router;
