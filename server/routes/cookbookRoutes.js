import express from "express";
// Import WITHOUT curly braces because it's a default export
import Cookbook from "../models/Cookbook.js"; 

const router = express.Router();
// GET all cookbooks
router.get('/', async (req, res) => {
  const books = await Cookbook.find();
  res.json(books);
});

// POST a new cookbook
router.post('/', async (req, res) => {
  const newBook = new Cookbook(req.body);
  const savedBook = await newBook.save();
  res.json(savedBook);
});

// DELETE a cookbook
router.delete('/:id', async (req, res) => {
  await Cookbook.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

const seedDefaults = async () => {
  const defaults = [
    { title: "Cooked It", subtitle: "Tried & True", color: "#f3d2a2", icon: "✅", category: "cooked" },
    { title: "To Cook", subtitle: "Future Feasts", color: "#a2d2f3", icon: "⏳", category: "to-cook" }
  ];

  for (const book of defaults) {
    // Check if a book with this category already exists
    const exists = await Cookbook.findOne({ category: book.category });
    if (!exists) {
      await Cookbook.create(book);
      console.log(`Seeded default book: ${book.title}`);
    }
  }
};

// Call this function once when the server starts
seedDefaults();
export default router;