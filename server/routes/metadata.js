//the goal of this code is to scrape website name and recipe title from a post a user creates
import express from "express";
import axios from "axios";
import * as cheerio from 'cheerio';

const router = express.Router();

router.post('/extract-recipe', async (req, res) => {
  const { url } = req.body;

  try {
    if (!url) {return res.status(400).json({ error: "No URL provided, scrape machine broke" });
  }
    //get website url and tell url you are a web browser to avoid suspicion... very sneaky
    const { data } = await axios.get(url, { 
      headers: { 'User-Agent': 'Mozilla/5.0' } });

    // Load HTML into Cheerio, which helps us extract title
    const $ = cheerio.load(data);

    // Extract the title, looking for an H1 first then the title in html
    const recipeTitle = $('h1').first().text().trim() || $('title').text().trim();

    res.json({ title: recipeTitle });
  } catch (error) {
    res.status(500).json({ error: "Could not fetch recipe title" });
  }});

export default router;