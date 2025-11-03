import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    type: { type: String, required: true }, // "thu" hoặc "chi"
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    desc: { type: String },
    date: { type: Date, required: true },
    userId: {
      // 👇 thêm giống reminder
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Transaction", transactionSchema);
