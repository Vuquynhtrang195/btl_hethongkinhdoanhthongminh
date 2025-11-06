import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true },
  limit: { type: Number, required: true },
  month: { type: Number, default: new Date().getMonth() + 1 },
  year: { type: Number, default: new Date().getFullYear() },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Budget", budgetSchema);