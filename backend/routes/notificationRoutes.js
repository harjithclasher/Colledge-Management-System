import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const getAudienceForUser = (user) => {
  if (!user) return "all";
  return user.role === "admin" || user.role === "faculty" ? "staff" : "students";
};

// List notifications for current user
router.get("/", protect, async (req, res, next) => {
  try {
    const audience = getAudienceForUser(req.user);
    const list = await Notification.find({
      $or: [
        { recipient: req.user._id },
        { recipient: { $exists: false } },
        { recipient: null, audience: "all" },
        { recipient: null, audience },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Mark notification as read
router.patch("/:id/read", protect, async (req, res, next) => {
  try {
    const updated = await Notification.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { readBy: req.user._id } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
