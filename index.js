const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

const fs = require("fs-extra");
const bcrypt = require("bcryptjs");
const USERS_FILE = "./users.json";

// Middleware
app.use(cors());
app.use(express.json());

// POST endpoint to validate QR code
app.post("/api/auth/verify", (req, res) => {
  const qr = req.body.qr;
  console.log("✅ Backend was hit");
  console.log("Received QR:", qr);
  // Fake validation logic for now
  if (qr === "MFA-SESSION-TEST12345") {
    return res.status(200).send("✅ MFA Verified Successfully");
  } else {
    return res.status(401).send("❌ Invalid or Expired QR Code");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`MFA Backend running on http://localhost:${PORT}`);
});



// Load users from file
async function loadUsers() {
  try {
    return await fs.readJson(USERS_FILE);
  } catch {
    return [];
  }
}

// Save users to file
async function saveUsers(users) {
  await fs.writeJson(USERS_FILE, users, { spaces: 2 });
}

// POST: Register User
app.post("/api/users/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).send("All fields are required.");
  }

  const users = await loadUsers();
  const existing = users.find(u => u.email === email.toLowerCase());
  if (existing) {
    return res.status(400).send("Email already registered.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = {
    id: Date.now().toString(),
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  };

  users.push(newUser);
  await saveUsers(users);

  console.log("✅ User registered:", email);
  res.status(201).send("User registered successfully.");
});
// POST: Login User
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send("Email and password are required.");
  }

  const users = await loadUsers();
  const user = users.find(u => u.email === email.toLowerCase());

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

