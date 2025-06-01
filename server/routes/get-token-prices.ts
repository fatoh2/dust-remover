import express from "express";
import { fetchPricesAM } from "./aftermath-prices.ts";

const router = express.Router();

router.post("/get-token-prices", async (req, res) => {
	const { symbols } = req.body;

	if (!Array.isArray(symbols)) {
		return res.status(400).json({ error: "symbols must be an array" });
	}

	const prices = await fetchPricesAM(symbols);
	res.json({ prices });
});

export default router;
