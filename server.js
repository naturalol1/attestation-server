import express from "express";
import axios from "axios";
import { randomBytes } from "crypto";

const app = express();
app.use(express.json());

const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

app.get("/get-challenge", (req, res) => {
  const challenge = Buffer.from(randomBytes(16))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  res.json({ challenge });
});

app.post("/verify-token", async (req, res) => {
  const { attestation_token } = req.body;

  try {
    const response = await axios.get(
      "https://graph.oculus.com/platform_integrity/verify",
      {
        params: {
          token: attestation_token,
          access_token: META_ACCESS_TOKEN,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Verification failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
