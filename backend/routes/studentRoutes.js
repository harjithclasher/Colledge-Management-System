import express from "express";
import User from "../models/User.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// List all student profiles
router.get("/", protect, async (req, res, next) => {
  try {
    const students = await User.find({ role: "student" }).select("name email skills role");
    res.json(students);
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

// Update own skills
router.put("/skills", protect, async (req, res, next) => {
  try {
    const { skills } = req.body;
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: "Skills must be an array" });
    }
    req.user.skills = skills;
    await req.user.save();
    res.json({ message: "Skills updated", skills: req.user.skills });
  } catch (err) {
    next(err);
  }
});

export default router;
