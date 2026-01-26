import mongoose from 'mongoose';
import Post from './models/Post.js';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const recipeData = [
  { name: "Spicy Miso Ramen", tags: ["dinner", "japanese"], time: 45, diff: "Medium", img: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624" },
  { name: "Blueberry Lemon Pancakes", tags: ["breakfast", "sweet"], time: 20, diff: "Easy", img: "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445" },
  { name: "Classic Pepperoni Pizza", tags: ["dinner", "italian"], time: 60, diff: "Hard", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38" },
  { name: "Avocado & Egg Toast", tags: ["lunch", "healthy"], time: 10, diff: "Easy", img: "https://images.unsplash.com/photo-1484723091739-30a097e8f929" },
  { name: "Garlic Butter Shrimp", tags: ["dinner", "seafood"], time: 15, diff: "Medium", img: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1" }
];

const dummyComments = [
  "Wow, this looks incredible! 🤤",
  "Just made this, family loved it.",
  "The presentation is 10/10!",
  "Adding this to my 'To Cook' list right now.",
  "Pro tip: add a squeeze of lime at the end!"
];

const seedDB = async () => {
  try {
    // Connect to your MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    // 1. ERASE OLD DATA
    console.log("🗑️  Erasing old posts and users...");
    await User.deleteMany({});
    await Post.deleteMany({});

    // 2. CREATE NEW USERS
    const users = [];
    for (let i = 0; i < 10; i++) {
      const user = await User.create({
        username: `Chef_${i + 1}`,
        email: `chef${i + 1}@test.com`,
        password: "password123",
        profilePic: `https://i.pravatar.cc/150?u=user${i}`,
        bio: "Exploring the CookUp prototype."
      });
      users.push(user);
    }
    console.log(`👤 Created ${users.length} fresh users.`);

    // 3. CREATE 50 NEW POSTS
    for (let i = 0; i < 50; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const recipe = recipeData[i % recipeData.length];

      // Generate 2-3 random comments for each post
      const postComments = [];
      const numComments = Math.floor(Math.random() * 3) + 1;
      
      for (let j = 0; j < numComments; j++) {
        const commentUser = users[Math.floor(Math.random() * users.length)];
        postComments.push({
          text: dummyComments[Math.floor(Math.random() * dummyComments.length)],
          username: commentUser.username,
          userAvatar: commentUser.profilePic, // Matches c.userAvatar in your RecipePost.jsx
          createdAt: new Date()
        });
      }

      await Post.create({
        user: randomUser._id.toString(),
        username: randomUser.username,
        userAvatar: randomUser.profilePic,
        recipeName: recipe.name,
        description: `This is my favorite way to make ${recipe.name}!`,
        dishImages: [`${recipe.img}?auto=format&fit=crop&w=800&q=80`],
        cookTime: recipe.time,
        difficulty: recipe.diff,
        rating: Math.floor(Math.random() * 2) + 4,
        tags: recipe.tags,
        kudosCount: Math.floor(Math.random() * 30),
        kudos: [],
        cookbookCategory: i % 2 === 0 ? "cooked" : "to-cook",
        comments: postComments
      });
    }

    console.log("✅ Database successfully reset and seeded with 50 posts!");
    process.exit();
  } catch (err) {
    console.error("❌ Seed Error:", err);
    process.exit(1);
  }
};

seedDB();

const restoreUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // 1. Check if the user already exists
    const existing = await User.findById("696e62fe468f4cf9678b5968");
    
    if (!existing) {
      await User.create({
        _id: "696e62fe468f4cf9678b5968", // Manually forcing the old ID
        username: "Benplot",
        email: "benplot@mit.edu", // Adjust to your real email
        password: "WaldenPond8?",    // You'll need to re-login with this
        profilePic: "https://res.cloudinary.com/ddhhjsobx/image/upload/v1769026667/jhxjpwvpv74svzvpkgkv.jpg",
        bio: "Ben Plotnik, CookUp Creator 🍳"
      });
      console.log("✅ User 'Benplot' restored with the old ID!");
    } else {
      console.log("User already exists in DB.");
    }
    
    process.exit();
  } catch (err) {
    console.error("Restoration failed:", err);
    process.exit(1);
  }
};

restoreUser();