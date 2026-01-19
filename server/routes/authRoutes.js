// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js"; 

const router = express.Router();

// 1. REGISTER (Sign Up)
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user exists (now checking email too)
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      bio: "",            // Initialize with empty bio
      profilePic: "",     // Initialize with empty profile pic
    });

    const savedUser = await newUser.save();

    // Respond with full user object (minus password)
    const { password: pw, ...userData } = savedUser._doc;
    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. LOGIN
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Return the full user object so the Frontend State has email, bio, and profilePic
    const { password: pw, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. UPDATE USER (The "Edit Profile" logic)
router.put("/update/:id", async (req, res) => {
  try {
    // Only allow update if the body contains the correct userId (basic security)
    if (req.body.userId === req.params.id) {
      // If updating password, hash it again
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true } // Returns the updated document instead of the old one
      ).select("-password");

      res.status(200).json(updatedUser);
    } else {
      res.status(403).json({ message: "You can only update your own account!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. GET: Get user info by ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);} catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;  