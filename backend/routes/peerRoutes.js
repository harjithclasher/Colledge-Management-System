import express from "express";
import PeerProfile from "../models/PeerProfile.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create or update peer profile - authenticated only
router.post("/profiles", protect, async (req, res, next) => {
  try {
    const { skills, bio } = req.body;
    const skillsArray = Array.isArray(skills)
      ? skills
      : String(skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);

    const profile = await PeerProfile.findOneAndUpdate(
      { studentEmail: req.user.email },
      { 
        studentName: req.user.name, 
        studentEmail: req.user.email, 
        skills: skillsArray, 
        bio 
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
});

// List/search profiles by skill - authenticated only
router.get("/profiles", protect, async (req, res, next) => {
  try {
    const { skill } = req.query;
    const query = {};
    if (skill) {
      query.skills = { $regex: new RegExp(skill, "i") };
    }
    const profiles = await PeerProfile.find(query).sort({ createdAt: -1 });
    res.json(profiles);
  } catch (err) {
    next(err);
  }
});

export default router;

