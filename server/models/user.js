// backend/models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // removed 'required' here to allow google users
    },
    profilePic: {
      type: String,
      default: "", // Stores the Cloudinary google image
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bio: {
      type: String,
      max: 150,
      default: "",
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // "sparse" allows multiple users to have 'null' for this field
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

export default mongoose.model("User", UserSchema);
