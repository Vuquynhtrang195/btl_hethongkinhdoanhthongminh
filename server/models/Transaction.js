import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
  type: { type: String, enum: ["thu", "chi"], required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  desc: { type: String },
  date: { type: Date, required: true },
});

export default mongoose.model("Transaction", transactionSchema);
