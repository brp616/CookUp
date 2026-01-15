import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error(err));

app.get("/", (req, res) => {
  res.send("CookUp API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

//tell me what this code means: This code sets up a basic Express.js server that connects to a MongoDB database using Mongoose. It includes the following key components:
//1. Imports necessary modules: express for server creation, mongoose for MongoDB interaction, cors for handling cross-origin requests, and dotenv for environment variable management.
//2. Configures environment variables using dotenv.