import express from "express";
import Cookbook from "../models/Cookbook.js"; 

const router = express.Router();

// 1. GET cookbooks for a specific user
// Usage: /api/cookbooks?userId=123
router.get('/', async (req, res) => {
  const { userId } = req.query;

  // Check for null, undefined, or the literal string "undefined"
  if (!userId || userId === "undefined" || userId === "null") {
    // Instead of a 400 error, just return an empty array.
    // This stops the "vanishing" effect and prevents the console error.
    return res.json([]); 
  }

  try {
    const books = await Cookbook.find({ user: userId });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. POST a new cookbook tied to a userId
router.post('/', async (req, res) => {
  try {
    // Expecting { title, userId, ... } in req.body
    console.log("--- DEBUG: Incoming Post Data ---");
  console.log(req.body); // Check your TERMINAL (not browser) for this output
    const { title, userId, color, icon, subtitle, visibility } = req.body;

    const newBook = new Cookbook({
      title,
      subtitle,
      color,
      icon,
      user: userId,
      visibility: visibility || 'public'
    });

    const savedBook = await newBook.save();
    res.json(savedBook);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. DELETE a cookbook
router.delete('/:id', async (req, res) => {
  try {
    await Cookbook.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;