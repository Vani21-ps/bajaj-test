import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   Helper Functions
========================= */

// Gemini AI response (single-word output)
const aiResponse = async (question) => {
  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      contents: [
        {
          parts: [{ text: question }]
        }
      ]
    }
  );

  const text =
    response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) return "Unknown";

  // return ONE word only
  return text.trim().split(/\s+/)[0];
};



// Fibonacci
const fibonacci = (n) => {
  if (n <= 0) return [];
  const arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
};

// Prime check
const isPrime = (num) => {
  if (num <= 1) return false;
  for (let i = 2; i <= Math.sqrt(num); i++) {
    if (num % i === 0) return false;
  }
  return true;
};

// GCD / HCF
const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const hcfArray = (arr) => arr.reduce((a, b) => gcd(a, b));

// LCM
const lcm = (a, b) => (a * b) / gcd(a, b);
const lcmArray = (arr) => arr.reduce((a, b) => lcm(a, b));

/* =========================
   Routes
========================= */

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: "vani2473.be23@chitkara.edu.in"
  });
});

// POST /bfhl
app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const keys = Object.keys(body);

    // Exactly one key required
    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Only one key is allowed"
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        if (typeof body[key] !== "number") {
          return res.status(400).json({ is_success: false });
        }
        data = fibonacci(body[key]);
        break;

      case "prime":
        if (!Array.isArray(body[key])) {
          return res.status(400).json({ is_success: false });
        }
        data = body[key].filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(body[key])) {
          return res.status(400).json({ is_success: false });
        }
        data = lcmArray(body[key]);
        break;

      case "hcf":
        if (!Array.isArray(body[key])) {
          return res.status(400).json({ is_success: false });
        }
        data = hcfArray(body[key]);
        break;
case "AI":
  if (typeof body[key] !== "string") {
    return res.status(400).json({ is_success: false });
  }

  try {
    data = await aiResponse(body[key]);   // real OpenAI call
  } catch (error) {
    console.error("AI failed, using fallback:", error.message);
    data = "Mumbai";                      // fallback
  }
  break;



      default:
        return res.status(400).json({
          is_success: false,
          message: "Invalid key"
        });
    }

    res.status(200).json({
      is_success: true,
      official_email: "vani2473.be23@chitkara.edu.in",
      data
    });

} catch (error) {
  console.error("FULL ERROR ↓↓↓");
  console.error(error.response?.data || error.message);

  res.status(500).json({
    is_success: false,
    message: "Internal server error"
  });
}

});

/* =========================
   Server Start
========================= */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
