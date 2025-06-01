import express from "express";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

const router = express.Router();
const client = new SuiClient({ url: getFullnodeUrl("mainnet") });

router.post("/get-token-metadata", async (req, res) => {
  const { coinTypes } = req.body;

  if (!Array.isArray(coinTypes)) {
    return res.status(400).json({ error: "coinTypes must be an array" });
  }

  const results = await Promise.allSettled(
    coinTypes.map((type) => client.getCoinMetadata({ coinType: type }))
  );

  const metadata = results.map((result, i) =>
    result.status === "fulfilled"
      ? { coinType: coinTypes[i], ...result.value }
      : { coinType: coinTypes[i], error: result.reason.toString() }
  );

  res.json({ metadata });
});

export default router;
