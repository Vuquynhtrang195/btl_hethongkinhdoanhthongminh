import mongoose from "mongoose";

const ReminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, required: true },
    description: String,
    dueAt: { type: Date, required: true }, // giờ bắt đầu event
    durationMin: { type: Number, default: 30 }, // mặc định 30p
    calendarEventId: String, // id event trên Google Calendar
    recurrence: { type: String, enum: ["NONE", "MONTHLY"], default: "NONE" },
    amount: Number, // tiền hóa đơn (nếu bạn muốn lưu)
    billType: String, // điện/nước/internet...
  },
  { timestamps: true }
);

export default mongoose.model("Reminder", ReminderSchema);
