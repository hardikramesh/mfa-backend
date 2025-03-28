const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/api/test", (req, res) => {
  const message = req.body.message;
  console.log("✅ Backend was hit");
  console.log("Message received:", message);

  return res.status(200).send(`👋 Hello! You sent: "${message}"`);
});

app.listen(PORT, () => {
  console.log(`MFA Backend running on port ${PORT}`);
});
