import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import User from "./models/User.js";
import Post from "./models/Post.js";

dotenv.config();

const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7bb7445",
  "https://images.unsplash.com/photo-1484723088339-ad447e3f93a2",
  "https://images.unsplash.com/photo-1473093226795-af9932fe5856",
];

const TAG_POOLS = [
  ["Vegan", "Healthy", "Breakfast"],
  ["Dinner", "Beef", "Hearty"],
  ["Dessert", "Sweet", "Baking"],
  ["Italian", "Pasta", "Dinner"],
  ["Quick", "Easy", "Lunch"],
  ["Keto", "High Protein", "Dinner"]
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    // 1. Create 10 Fake Users
    const users = [];
for (let i = 0; i < 10; i++) {
  const username = faker.internet.username().toLowerCase(); // Changed from userName
  users.push({
    username,
    email: faker.internet.email({ firstName: username }), // Slightly updated syntax
    password: "password123",
    profilePic: `https://ui-avatars.com/api/?name=${username}&background=random`,
    bio: faker.lorem.sentence(),
  });
}
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // 2. Create 50 Fake Posts
    const posts = [];
    for (let i = 0; i < 50; i++) {
      const randomUser = createdUsers[Math.floor(Math.random() * createdUsers.length)];
      const randomTags = TAG_POOLS[Math.floor(Math.random() * TAG_POOLS.length)];
      
      posts.push({
        user: randomUser._id.toString(),
        username: randomUser.username,
        userAvatar: randomUser.profilePic,
        recipeName: faker.food.adjective() + ' ' + faker.food.dish(),
        description: faker.food.description(),
        recipeLink: faker.internet.url(),
        dishImages: [faker.helpers.arrayElement(FOOD_IMAGES)],
        cookTime: faker.number.int({ min: 10, max: 180 }),
        difficulty: faker.helpers.arrayElement(["Easy", "Medium", "Hard"]),
        rating: faker.number.int({ min: 3, max: 5 }),
        tags: randomTags,
        kudosCount: faker.number.int({ min: 0, max: 100 }),
        sourceUrl: faker.internet.url(),
        sourceName: faker.company.name(),
        visibility: "public",
        comments: Array.from({ length: faker.number.int({ min: 0, max: 3 }) }).map(() => ({
          text: faker.lorem.sentence(),
          username: createdUsers[Math.floor(Math.random() * createdUsers.length)].username,
          createdAt: new Date(),
        })),
      });
    }

    await Post.insertMany(posts);
    console.log(`✅ Created ${posts.length} posts`);

    process.exit();
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
}

seedDatabase();