import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
 username: String,
  userAvatar: String,
  recipeName: String,
  description: String,
  recipeLink: String,
 dishImages: [{ type: String }], // Array of URLs (from Cloudinary or S3),
  cookTime: Number,
  difficulty: String,
  rating: { type: Number, default: 5 },
  tags: [String], // Array of strings: ['dinner', 'vegan']
  kudosCount: { type: Number, default: 0 },
  sourceUrl: String,           // e.g., "https://www.seriouseats.com/..."
  sourceName: String,          // e.g., "Serious Eats"
  originalRecipeName: String   // e.g., "The Best Crispy Roast Potatoes"
,
comments: [{
    text: String,
    username: String,
    createdAt: { type: Date, default: Date.now }
  }]},
{ timestamps: true });


// Ensure this EXACT line is at the bottom
const Post = mongoose.model('Post', postSchema);
export default Post;