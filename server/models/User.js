import mongoose from "mongoose";

const GoogleTokenSchema = new mongoose.Schema(
  {
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expiry_date: Number, // ms
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    google: GoogleTokenSchema, // lưu token OAuth2 ở đây
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
