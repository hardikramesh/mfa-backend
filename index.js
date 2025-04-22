const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection string (with encoded password)
const mongoUri = "mongodb+srv://Hardik:H%40rd%21k12@mfa-cluster.cypbsin.mongodb.net/mfa-auth?retryWrites=true&w=majority";

// Connect to MongoDB Atlas
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Connected to MongoDB Atlas via Mongoose"))
.catch((err) => console.error("❌ Mongoose connection error:", err));

// Define User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String
});

const User = mongoose.model("User", userSchema);

// Middleware
app.use(cors());
app.use(express.json());

// ✅ POST: Register User
app.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("📥 Registering:", email);

    if (!name || !email || !password) {
      return res.status(400).send("All fields are required.");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).send("Email already registered.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword
    });

    console.log("✅ Registered:", email);
    res.status(201).send("User registered successfully.");
  } catch (err) {
    console.error("❌ Registration Error:", err.message);
    res.status(500).send("Server error during registration.");
  }
});

// 🔐 POST: Login User
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);

    if (!email || !password) {
      return res.status(400).send("Email and password are required.");
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).send("Invalid email or password.");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).send("Invalid email or password.");
    }

    res.status(200).send("✅ Login successful.");
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).send("Server error during login.");
  }
});

// 🔍 POST: Verify QR Code
app.post("/api/auth/verify", (req, res) => {
  const qr = req.body.qr;
  console.log("📸 Scanned QR:", qr);

  if (qr === "MFA-SESSION-TEST12345") {
    return res.status(200).send("✅ MFA Verified Successfully");
  } else {
    return res.status(401).send("❌ Invalid or Expired QR Code");
  }
});

// 🚀 Start server
app.listen(PORT, () => {
  console.log(`MFA Backend running on http://localhost:${PORT}`);
});
