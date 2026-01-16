import mongoose from 'mongoose';

const cookbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  color: { type: String, default: "#f3d2a2" },
  icon: { type: String, default: "📚" },
  category: { type: String, required: true, unique: true }
});

const Cookbook = mongoose.model('Cookbook', cookbookSchema);
export default Cookbook;