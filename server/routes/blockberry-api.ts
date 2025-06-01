import express from "express";
import axios from "axios";

const API_TOKEN = 'pt0KWv6G0myckUcR1lLpyRq1uvx6O2';
const WALLET_ADDRESS = '0xbe1d2b816cf0419257949f780f964ffcc1dff0d7c7afa26908d653b5c44f016c';

const router = express.Router();

router.post("/get-token-metadata", async (req, res) => {
  const { coinTypes } = req.body;

  if (!Array.isArray(coinTypes)) {
    return res.status(400).json({ error: "coinTypes must be an array" });
  }

  try {
    const results = await Promise.allSettled(
      coinTypes.map(async (coinType) => {
        const response = await axios.get("https://api.blockberry.one/v1/get_token_metadata", {
          params: { token_type: coinType },
        });

        return {
          coinType,
          ...response.data,
        };
      })
    );

    const metadata = results.map((result, i) =>
      result.status === "fulfilled"
        ? result.value
        : { coinType: coinTypes[i], error: result.reason.toString() }
    );

    res.json({ metadata });
  } catch (err) {
    console.error("Blockberry API failed", err);
    res.status(500).json({ error: "Failed to fetch metadata from Blockberry." });
  }
});

router.get("/get-balance", async (req, res) => {
  const url = "https://api.blockberry.one/sui/v1/accounts/".concat(WALLET_ADDRESS, "/balance");

  try {
    const options = {
      method: 'GET',
      headers: { accept: '*/*', 'x-api-key': API_TOKEN },
    };

    const response = await fetch(url, options);
    const data = await response.json();

    res.json(data); // ✅ send data to the client
  } catch (err) {
    console.error("Blockberry API failed", err);
    res.status(500).json({ error: "Failed to fetch metadata from Blockberry." });
  }
});

export default router;
