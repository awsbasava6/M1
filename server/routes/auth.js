// server/routes/auth.js
import express from "express";
import dotenv from "dotenv";
import twilio from "twilio";
import User from "../models/user.js";
import Otp from "../models/Otp.js";

dotenv.config();
const router = express.Router();

// Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Create FamTree ID
 */
function createFamTreeId(payload) {
  const f = (s) => (s && s.toString().trim().charAt(0).toUpperCase()) || "X";
  const initials = `${f(payload.country)}${f(payload.state)}${f(payload.district)}${f(payload.taluk)}${f(payload.village)}`;
  const last4Aadhaar = (payload.aadhaar || "").slice(-4);
  const fullName = `${payload.firstName}${payload.middleName || ""}${payload.lastName}`;
  return `${initials}${fullName.toUpperCase()}${last4Aadhaar}`;
}

/**
 * SEND OTP
 * POST /api/auth/send-otp
 */
router.post("/send-otp", async (req, res) => {
  try {
    let { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "phoneNumber required" });
    }

    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+91" + phoneNumber;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Remove previous OTPs
    await Otp.deleteMany({ phoneNumber });

    // Save OTP in MongoDB
    await Otp.create({
      phoneNumber,
      otp,
      payload: req.body,
    });

    // Send OTP via Twilio
    await client.messages.create({
      body: `Your Digi-FamTree OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log(`✅ OTP ${otp} sent to ${phoneNumber}`);
    return res.json({ success: true, message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ send-otp error:", err);
    return res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

/**
 * VERIFY OTP
 * POST /api/auth/verify-otp
 */
router.post("/verify-otp", async (req, res) => {
  try {
    let { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ success: false, message: "phoneNumber and otp required" });
    }

    if (!phoneNumber.startsWith("+")) {
      phoneNumber = "+91" + phoneNumber;
    }

    const record = await Otp.findOne({ phoneNumber });

    if (!record) {
      return res.status(400).json({ success: false, message: "OTP expired or not found" });
    }

    if (record.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    const payload = record.payload;

    let user = await User.findOne({ phoneNumber });

    if (!user) {
      let famTreeId = createFamTreeId(payload);

      // ensure uniqueness
      while (await User.findOne({ famTreeId })) {
        famTreeId = createFamTreeId(payload);
      }

      user = new User({
        ...payload,
        phoneNumber,
        verified: true,
        famTreeId,
      });
    } else {
      Object.assign(user, payload);
      user.verified = true;
      if (!user.famTreeId) {
        user.famTreeId = createFamTreeId(payload);
      }
    }

    await user.save();

    // Delete OTP after success
    await Otp.deleteMany({ phoneNumber });

    // Send FamTree ID via SMS
    await client.messages.create({
      body: `Your Digi-FamTree ID: ${user.famTreeId}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return res.json({
      success: true,
      message: "OTP verified and account created",
      user,
    });

  } catch (err) {
    console.error("❌ verify-otp error:", err);
    return res.status(500).json({ success: false, message: "OTP verification failed" });
  }
});

export default router;

