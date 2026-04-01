import express from "express";
import Feedback from "../models/Feedback.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create feedback (student)
router.post("/", protect, async (req, res, next) => {
  try {
    const { category, rating, message } = req.body;
    if (!category || !rating || !message) {
      return res.status(400).json({ message: "category, rating, and message are required" });
    }
    const feedback = await Feedback.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      category,
      rating,
      message,
    });
    res.status(201).json(feedback);
  } catch (err) {
    next(err);
  }
});

// Get feedback list (staff sees all, others see their own)
router.get("/", protect, async (req, res, next) => {
  try {
    const isStaff = ["admin", "faculty"].includes(req.user.role);
    const query = isStaff ? {} : { user: req.user._id };
    const list = await Feedback.find(query).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Respond to feedback (staff only)
router.patch("/:id/respond", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const { response } = req.body;
    if (!response || !response.trim()) {
      return res.status(400).json({ message: "response is required" });
    }
    const updated = await Feedback.findByIdAndUpdate(
      req.params.id,
      {
        response: response.trim(),
        respondedBy: req.user._id,
        respondedAt: new Date(),
      },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Feedback not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
