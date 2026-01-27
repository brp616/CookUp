import mongoose from "mongoose";
import User from "./models/user.js"; 
import Cookbook from "./models/Cookbook.js"; 
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const seedExistingUsers = async () => {
  try {
    const connectionString = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!connectionString) {
      console.error("❌ No MongoDB URI found in .env");
      process.exit(1);
    }

    await mongoose.connect(connectionString);
    console.log("✅ Connected to MongoDB.");

    // 1. DROP THE OLD INDEX
    // This removes the global "unique category" rule that caused the crash
    try {
      await Cookbook.collection.dropIndex("category_1");
      console.log("🗑️ Dropped old unique index 'category_1'.");
    } catch (e) {
      console.log("ℹ️ No old index 'category_1' found or already deleted.");
    }

    const users = await User.find();
    console.log(`Checking ${users.length} users...`);
    
    let seededCount = 0;

    for (const user of users) {
      const defaults = [
        { 
          title: "To Cook", 
          subtitle: "Future Deliciousness", 
          color: "#a2d2f3", 
          icon: "⏳", 
          category: "to-cook", 
          userId: user._id,
          visibility: "public"
        },
        { 
          title: "Cooked", 
          subtitle: "Tried and True", 
          color: "#a2f3a2", 
          icon: "🍳", 
          category: "cooked", 
          userId: user._id,
          visibility: "public"
        }
      ];

      for (const book of defaults) {
        // 2. UPSERT LOGIC
        // This looks for a book with THIS userId and THIS category.
        // If it doesn't find one, it inserts the default.
        await Cookbook.findOneAndUpdate(
          { userId: user._id, category: book.category },
          { $setOnInsert: book },
          { upsert: true, new: true }
        );
      }
      
      seededCount++;
      if (seededCount % 10 === 0) console.log(`Processed ${seededCount} users...`);
    }

    console.log(`\n✨ Migration complete! Processed ${users.length} users.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  }
};

seedExistingUsers();