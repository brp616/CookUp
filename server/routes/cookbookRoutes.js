import express from "express";
import Cookbook from "../models/Cookbook.js";

const router = express.Router();

/**
 * GET: Fetch cookbooks for a specific user
 * URL example: /api/cookbooks?userId=12345
 */
router.get("/", async (req, res) => {
  const { userId } = req.query;

  // Safety check for guest users or malformed IDs
  if (!userId || userId === "undefined" || userId === "null") {
    return res.json([]);
  }

  try {
    // Finds all custom cookbooks created by this user
    const books = await Cookbook.find({ userId: userId });
    res.json(books);
  } catch (err) {
    console.error("GET Cookbooks Error:", err);
    res.status(500).json({ message: "Error fetching cookbooks." });
  }
});

/**
 * POST: Create a new cookbook
 */
router.post("/", async (req, res) => {
  try {
    const { title, userId, color, icon, subtitle, visibility } = req.body;

    // Basic Validation
    if (!title || !userId) {
      return res.status(400).json({ message: "Title and userId are required." });
    }

    // Generate a 'category' slug from the title.
    // This is used to link Posts to this specific folder.
    const categorySlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-");    // Replace spaces with dashes

    // Check if this specific user already has a book with this category
    const existingBook = await Cookbook.findOne({ userId, category: categorySlug });
    if (existingBook) {
      return res.status(400).json({ message: "You already have a cookbook with this name." });
    }

    const newBook = new Cookbook({
      userId,
      title,
      subtitle: subtitle || "Personal Collection",
      color: color || "#f3d2a2",
      icon: icon || "📚",
      category: categorySlug,
      visibility: visibility || "public", // Schema enum handles "public" vs "followers"
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    console.error("POST Cookbook Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({ 
        message: "A cookbook with a similar name already exists. Please try a unique title." 
      });
    }

    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE: Remove a cookbook by ID
 * Note: Recipes associated with this category stay in the DB
 */
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.query; // Ensure user identity for security
    const bookId = req.params.id;

    const book = await Cookbook.findById(bookId);

    if (!book) {
      return res.status(404).json({ message: "Cookbook not found." });
    }

    // Security: Convert ObjectId to string for comparison
    if (book.userId.toString() !== userId) {
      return res.status(403).json({ message: "You do not have permission to delete this book." });
    }

    await Cookbook.findByIdAndDelete(bookId);
    res.json({ message: "Cookbook deleted successfully." });
  } catch (err) {
    console.error("DELETE Cookbook Error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;