import mongoose from 'mongoose';

const cookbookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.String, ref: 'User', required: true
  },
  title: { type: String, required: true },
  subtitle: { type: String },
  color: { type: String, default: "#f3d2a2" },
  icon: { type: String, default: "📚" },
  category: { type: String, required: true },
   visibility: {
      type: String,
      enum: ["public", "followers"], // Only allow these two values
      default: "public",
    }
});
cookbookSchema.index({ userId: 1, category: 1 }, { unique: true });

const Cookbook = mongoose.model('Cookbook', cookbookSchema);
export default Cookbook;