import express from "express";
import cors from "cors";
import metadataRouter from "./routes/get-token-metadata.ts";
import tokenPricesRouter from "./routes/get-token-prices.ts";
import getBalanceRouter from "./routes/blockberry-api.ts";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const router = express.Router();

// Mount your route here
app.use("/api", metadataRouter); // or use a prefix like: /api
app.use("/api", tokenPricesRouter);
app.use("/api", getBalanceRouter);

// router.post("/get-token-prices", async (req, res) => {
// 	const { symbols } = req.body;

// 	if (!Array.isArray(symbols)) {
// 		return res.status(400).json({ error: "symbols must be an array" });
// 	}

// 	const prices = await fetchPricesAM(symbols);
// 	res.json({ prices });
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});