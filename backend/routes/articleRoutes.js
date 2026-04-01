import express from "express";
import Article from "../models/Article.js";
import Notification from "../models/Notification.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/articles
router.get("/", protect, async (_req, res, next) => {
  try {
    const list = await Article.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    next(err);
  }
});

// GET /api/articles/:id
router.get("/:id", protect, async (req, res, next) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json(article);
  } catch (err) {
    next(err);
  }
});

// POST /api/articles (staff only)
router.post("/", protect, authorize("admin", "faculty"), async (req, res, next) => {
  try {
    const { title, summary, content, tag } = req.body;
    if (!title || !summary || !tag) {
      return res.status(400).json({ message: "title, summary, and tag are required" });
    }
    const created = await Article.create({
      title,
      summary,
      content: content || "",
      tag,
      author: req.user.name,
      createdBy: req.user._id,
    });
    await Notification.create({
      type: "article",
      title: `New article: ${title}`,
      message: summary,
      link: "/articles",
      audience: "all",
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

export default router;
