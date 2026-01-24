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
      // We remove "required: true" to allow Google Users to exist
      // without a standard password field.
    },
    profilePic: {
      type: String,
      default: "", // Stores the Cloudinary URL or Google Image URL
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
); // Automatically adds 'updatedAt' fields

export default mongoose.model("User", UserSchema);
