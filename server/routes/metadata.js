import express from "express";
import axios from "axios";
import * as cheerio from 'cheerio';

const router = express.Router();

router.post('/extract-recipe', async (req, res) => {
  const { url } = req.body;

  try {
    // 1. Fetch the HTML of the external site
    const { data } = await axios.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' } 
    });

    // 2. Load HTML into Cheerio
    const $ = cheerio.load(data);

    // 3. Extract the title (usually the Recipe Name)
    // We look for <h1> first, then <title>
    const recipeTitle = $('h1').first().text().trim() || $('title').text().trim();

    res.json({ title: recipeTitle });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch recipe title" });
  }
});

export default router;