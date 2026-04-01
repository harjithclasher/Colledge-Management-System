import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import GalleryItem from "../models/GalleryItem.js";
import Notification from "../models/Notification.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// List gallery items (all authenticated users)
router.get("/", protect, async (_req, res, next) => {
  try {
    const items = await GalleryItem.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// Create gallery item (staff only)
router.post(
  "/",
  protect,
  authorize("admin", "faculty"),
  upload.single("image"),
  async (req, res, next) => {
    try {
      const { title, category, color } = req.body;
      if (!title || !category || !color) {
        return res.status(400).json({ message: "title, category, and color are required" });
      }
      const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
      const imageName = req.file ? req.file.originalname : "";
      const created = await GalleryItem.create({
        title,
        category,
        color,
        imageUrl,
        imageName,
        createdBy: req.user._id,
      });
      await Notification.create({
        type: "gallery",
        title: `New gallery item: ${title}`,
        message: category,
        link: "/gallery",
        audience: "all",
      });
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }
);

// Delete gallery item (staff only)
router.delete("/:id", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Gallery item not found" });
    }
    if (item.imageUrl) {
      const filePath = path.join(uploadDir, path.basename(item.imageUrl));
      fs.promises.unlink(filePath).catch(() => {});
    }
    await item.deleteOne();
    res.json({ message: "Gallery item deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
