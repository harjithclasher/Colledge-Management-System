import express from "express";
import PlacementApplication from "../models/PlacementApplication.js";
import PlacementOpportunity from "../models/PlacementOpportunity.js";
import Notification from "../models/Notification.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/placements/applications - student applies
router.post("/applications", protect, async (req, res, next) => {
  try {
    const payload = {
      ...req.body,
      studentId: req.user._id,
      studentEmail: req.user.email,
      studentName: req.user.name,
    };
    const created = await PlacementApplication.create(payload);
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// GET /api/placements/applications/me - student view own applications
router.get("/applications/me", protect, async (req, res, next) => {
  try {
    const apps = await PlacementApplication.find({ studentId: req.user._id })
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
});

// GET /api/placements/applications - staff view all
router.get("/applications", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const apps = await PlacementApplication.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    next(err);
  }
});

// GET /api/placements/opportunities - list opportunities
router.get("/opportunities", protect, async (_req, res, next) => {
  try {
    const list = await PlacementOpportunity.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// POST /api/placements/opportunities - staff creates opportunity
router.post("/opportunities", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const { company, role, package: pkg, location, deadline } = req.body;
    if (!company || !role) {
      return res.status(400).json({ message: "company and role are required" });
    }
    const created = await PlacementOpportunity.create({
      company,
      role,
      package: pkg || "",
      location: location || "",
      deadline: deadline || "",
      tag: "New",
      createdBy: req.user._id,
    });
    await Notification.create({
      type: "placement",
      title: `New placement: ${company}`,
      message: `${role}${location ? ` · ${location}` : ""}`,
      link: "/placements",
      audience: "all",
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
