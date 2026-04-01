import express from "express";
import User from "../models/User.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get current user profile
router.get("/me", protect, async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (err) {
    next(err);
  }
});

// Search students by skill
router.get("/search", protect, async (req, res, next) => {
  try {
    const { skill } = req.query;
    const query = { role: "student" };
    if (skill) {
      query.skills = { $regex: new RegExp(skill, "i") };
    }
    const students = await User.find(query).select("name email skills role");
    res.json(students);
  } catch (err) {
    next(err);
  }
});

// Get all users (admin only)
router.get("/", protect, authorize("admin"), async (req, res, next) => {
  try {
    const users = await User.find().select("name email role skills");
    res.json(users);
  } catch (err) {
    next(err);
  }
});

// Update own skills
router.put("/skills", protect, async (req, res, next) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "skills must be an array" });
    }
    req.user.skills = skills;
    await req.user.save();
    res.json({ message: "Skills updated", skills: req.user.skills });
  } catch (err) {
    next(err);
  }
});

export default router;
