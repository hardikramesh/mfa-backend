const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

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
