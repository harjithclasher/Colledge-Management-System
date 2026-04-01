import express from "express";
import Notice from "../models/Notice.js";
import Notification from "../models/Notification.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// List notices (all authenticated users)
router.get("/", protect, async (_req, res, next) => {
  try {
    const list = await Notice.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Create notice (staff only)
router.post("/", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const { title, body, tag } = req.body;
    if (!title || !body || !tag) {
      return res.status(400).json({ message: "title, body, and tag are required" });
    }
    const created = await Notice.create({
      title,
      body,
      tag,
      createdBy: req.user._id,
    });
    await Notification.create({
      type: "notice",
      title: `New notice: ${title}`,
      message: body,
      link: "/notices",
      audience: "all",
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
