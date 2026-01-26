import mongoose from 'mongoose';

const cookbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  color: { type: String, default: "#f3d2a2" },
  icon: { type: String, default: "📚" },
  category: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.String, ref: 'User', required: true },
   visibility: {
      type: String,
      enum: ["public", "followers", "only me"], // Only allow these two values
      default: "public",
    }
});

const Cookbook = mongoose.model('Cookbook', cookbookSchema);
export default Cookbook;