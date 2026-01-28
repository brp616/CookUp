import mongoose from "mongoose";
import user from "../models/user.js";

const postSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.Mixed, ref: 'User' },
    username: String,
    userAvatar: String,
    recipeName: String,
    description: String,
    recipeLink: String,
    dishImages: [{ type: String }], // Array of URLs (from Cloudinary),
    cookTime: Number,
    difficulty: String,
    rating: { type: Number, default: 5 },
    tags: [String], // Array of strings: ['dinner', 'vegan']
    kudosCount: { type: Number, default: 0 },
kudos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Array of User IDs who clicked Yum
    sourceUrl: String, // e.g., "https://www.seriouseats.com/..."
    sourceName: String, // e.g., "Serious Eats"
    originalRecipeName: String, // e.g., "miso salmon"
    cookbookCategory: {
      type: String,
      default: "none",
    },
    cookbookId: [{ 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Cookbook' 
}], //allows for multiple cookbooks
    visibility: {
      type: String,
      enum: ["public", "followers"], // Only allow these two values
      default: "public",
    },
    comments: [
      {
        text: String,
        username: String,
        userAvatar: { type: String, default: "" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

// exporting it
const Post = mongoose.model("Post", postSchema);
export default Post;
