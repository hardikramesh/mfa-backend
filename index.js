const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Atlas connection
const uri = "mongodb+srv://Hardik:H%40rd%21k12@mfa-cluster.cypbsin.mongodb.net/mfa-auth?retryWrites=true&w=majority&appName=mfa-cluster";
const client = new MongoClient(uri);
let usersCollection;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB Atlas");

    const db = client.db("mfa-auth"); // You can name this database
    usersCollection = db.collection("users");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
  }
}
connectDB();

// ✅ POST: Register User
app.post("/api/users/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  const existing = await usersCollection.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).send("Email already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  };

  await usersCollection.insertOne(newUser);

  console.log("✅ User registered:", email);
  res.status(201).send("User registered successfully.");
});

// 🔐 POST: Login User
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const user = await usersCollection.findOne({ email: email.toLowerCase() });

  if (!user) {
    return res.status(401).send("Invalid email or password.");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).send("Invalid email or password.");
  }

  console.log("✅ User logged in:", user.email);
  res.status(200).send("Login successful.");
});

// 📷 POST: Verify QR Code
app.post("/api/auth/verify", (req, res) => {
  const qr = req.body.qr;
  console.log("✅ Backend was hit");
  console.log("Received QR:", qr);

  // Fake logic: replace with real session check later
  if (qr === "MFA-SESSION-TEST12345") {
    return res.status(200).send("✅ MFA Verified Successfully");
  } else {
    return res.status(401).send("❌ Invalid or Expired QR Code");
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 MFA Backend running on http://localhost:${PORT}`);
});
