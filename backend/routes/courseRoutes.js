import express from "express";
import Course from "../models/Course.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/courses
router.get("/", protect, async (req, res, next) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

// POST /api/courses
router.post("/", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const course = await Course.create(req.body);
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/courses/:id
router.delete("/:id", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted" });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/courses/:id/syllabus
router.patch("/:id/syllabus", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const { syllabusText, syllabusUrl } = req.body;
    const updated = await Course.findByIdAndUpdate(
      req.params.id,
      { syllabusText: syllabusText || "", syllabusUrl: syllabusUrl || "" },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Course not found" });
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;

