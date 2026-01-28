// backend/routes/authRoutes.js
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.js"; 

const router = express.Router();

// 1. REGISTER (Standard Email/Password)
router.post("/register", async (req, res) => {
 try {
    const { username, email, password } = req.body;
    const normalizedUsername = username.toLowerCase();

 

    // --- MANUAL VALIDATION ---
    // Since password is now optional in the Schema for Google users,
    // we must strictly require it here for manual sign-ups.
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password is required and must be at least 6 characters." });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username: normalizedUsername }] });
    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      bio: "New Chef in the kitchen! 🔪", // Default fun bio
      profilePic: "", 
    });

    const savedUser = await newUser.save();
    const { password: pw, ...userData } = savedUser._doc;
    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. GOOGLE AUTH (OAuth Sign-in/Sign-up)
router.post("/google", async (req, res) => {
  try {
    const { username, email, profilePic, googleId } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      // If user exists, update their profile picture if they don't have one
      if (!user.profilePic && profilePic) {
        user.profilePic = profilePic;
        await user.save();
      }
      const { password, ...userData } = user._doc;
      return res.status(200).json(userData);
    } else {
      // Create a new user (password is not required for Google users)
      const newUser = new User({
        username: username.split(" ").join("").toLowerCase() + Math.floor(Math.random() * 1000),
        email,
        profilePic: profilePic || "",
        bio: "Joined via Google 🥗",
        googleId: googleId 
      });

      const savedUser = await newUser.save();
      
      const { password: pw, ...userData } = savedUser._doc;
      res.status(201).json(userData);
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. LOGIN (Standard)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase();

    const user = await User.findOne({ username: normalizedUsername });
    
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Google-only users might not have a password set
    if (!user.password) {
      return res.status(400).json({ message: "Please log in using Google." });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const { password: pw, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. UPDATE USER (Edit Profile)
router.put("/update/:id", async (req, res) => {
  try {
    // Basic security: check if user ID matches params
    if (req.body.userId === req.params.id) {
      
      // If updating password, hash the new one
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      ).select("-password");

      res.status(200).json(updatedUser);
    } else {
      res.status(403).json({ message: "You can only update your own account!" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. GET USER BY ID (Profile View)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;