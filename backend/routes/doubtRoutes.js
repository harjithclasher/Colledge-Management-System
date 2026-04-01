import express from "express";
import DoubtRequest from "../models/DoubtRequest.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create doubt request - authenticated only
router.post("/", protect, async (req, res, next) => {
  try {
    const { toEmail, subject, message, skill } = req.body;
    if (!toEmail || !subject || !message) {
      return res.status(400).json({ message: "toEmail, subject, and message are required" });
    }
    const doubt = await DoubtRequest.create({
      fromName: req.user.name,
      fromEmail: req.user.email,
      toEmail,
      skill,
      subject,
      message,
    });
    const mentor = await User.findOne({ email: toEmail }).select("_id");
    if (mentor) {
      await Notification.create({
        type: "doubt",
        title: "New doubt request",
        message: `${req.user.name} asked a doubt in ${skill || "General"}.`,
        link: "/doubt-requests",
        recipient: mentor._id,
      });
    }
    res.status(201).json(doubt);
  } catch (err) {
    next(err);
  }
});

// Incoming requests for logged in helper
router.get("/incoming", protect, async (req, res, next) => {
  try {
    const list = await DoubtRequest.find({ toEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Sent requests by logged-in student
router.get("/sent", protect, async (req, res, next) => {
  try {
    const list = await DoubtRequest.find({ fromEmail: req.user.email }).sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// Answer a doubt (only the receiver can respond)
router.patch("/:id/answer", protect, async (req, res, next) => {
  try {
    const { answer } = req.body;
    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "answer is required" });
    }
    const doubt = await DoubtRequest.findById(req.params.id);
    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found" });
    }
    if (doubt.toEmail !== req.user.email) {
      return res.status(403).json({ message: "Forbidden" });
    }
    doubt.response = answer.trim();
    doubt.status = "resolved";
    doubt.respondedBy = req.user._id;
    doubt.respondedAt = new Date();
    await doubt.save();

    const requester = await User.findOne({ email: doubt.fromEmail }).select("_id");
    if (requester) {
      await Notification.create({
        type: "doubt_answer",
        title: "Your doubt was answered",
        message: `Your doubt on ${doubt.skill || "General"} was answered by ${req.user.name}.`,
        link: "/doubt-requests",
        recipient: requester._id,
      });
    }
    res.json(doubt);
  } catch (err) {
    next(err);
  }
});

export default router;

