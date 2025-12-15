import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true },
  otp: { type: String, required: true },
  payload: { type: Object },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // ⏱ auto-delete after 5 minutes
  }
});

export default mongoose.model("Otp", otpSchema);

