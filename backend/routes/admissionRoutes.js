import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import AdmissionApplication from "../models/AdmissionApplication.js";
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
    const allowed = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only PDF/JPG/PNG/WEBP files are allowed"));
    }
    cb(null, true);
  },
});

// Create application (student)
router.post("/", protect, async (req, res, next) => {
  try {
    const { program, score } = req.body;
    if (!program || !score) {
      return res.status(400).json({ message: "program and score are required" });
    }
    const application = await AdmissionApplication.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      program,
      score,
      status: "Submitted",
    });
    res.status(201).json(application);
  } catch (err) {
    next(err);
  }
});

// List applications (staff sees all, student sees own)
router.get("/", protect, async (req, res, next) => {
  try {
    const isStaff = ["admin", "faculty"].includes(req.user.role);
    const query = isStaff ? {} : { user: req.user._id };
    const list = await AdmissionApplication.find(query).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Update status/message/schedule (staff only)
router.patch("/:id", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const { status, message, scheduledVisitDate } = req.body;
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }
    const update = {
      status,
      staffMessage: message || "",
      respondedBy: req.user._id,
    };
    if (scheduledVisitDate) {
      update.scheduledVisitDate = new Date(scheduledVisitDate);
    }
    const updated = await AdmissionApplication.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Upload document (student only, own application)
router.post(
  "/:id/document",
  protect,
  upload.single("document"),
  async (req, res, next) => {
    try {
      const application = await AdmissionApplication.findById(req.params.id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      if (application.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Forbidden" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "document is required" });
      }
      application.documentUrl = `/uploads/${req.file.filename}`;
      application.documentName = req.file.originalname;
      application.documentUploadedAt = new Date();
      if (application.status === "Documents Requested") {
        application.status = "Documents Submitted";
      }
      await application.save();
      res.json(application);
    } catch (err) {
      next(err);
    }
  }
);

export default router;
