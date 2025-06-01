import { Aftermath } from "aftermath-ts-sdk";

const afSdk = new Aftermath("MAINNET"); // "MAINNET" | "TESTNET"

try {
  await afSdk.init(); // initialize provider
  console.log("✅ Aftermath SDK initialized.");
} catch (e) {
  console.error("❌ Failed to initialize Aftermath SDK:", e);
  process.exit(1);
}

const WALLET_ADDRESS = "0xbe1d2b816cf0419257949f780f964ffcc1dff0d7c7afa26908d653b5c44f016c";

const router = afSdk.Router();

// // Get a trade route
// const route = await router.getCompleteTradeRouteGivenAmountIn({
// 	coinInType: "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
// 	coinOutType:
// 		"0x2::sui::SUI",
// 	coinInAmount: BigInt(1_000_000_000),
// 	// referrer: "0x...",
// });

// // Generate transaction for the route
// const tx = await router.getTransactionForCompleteTradeRoute({
// 	walletAddress: WALLET_ADDRESS,
// 	completeRoute: route,
// 	slippage: 0.01,
// });

// console.log(tx)
let completeRoute;

try {
  completeRoute = await router.getCompleteTradeRouteGivenAmountIn({
    coinInAmount: BigInt("100000"),
    coinInType:
      "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
    coinOutType: "0x2::sui::SUI",
  });

  console.log("✅ Route found:");
  console.dir(completeRoute, { depth: null });
} catch (e) {
  console.error("❌ Failed to get trade route:", e);
  process.exit(1);
}

if (!completeRoute.routes || completeRoute.routes.length === 0) {
    console.error("❌ No trade route found.");
    process.exit(1);
  }

const selectedRoute = completeRoute;

try {
    const transaction = await router.getTransactionForCompleteTradeRoute({
      walletAddress: WALLET_ADDRESS,
      completeRoute: selectedRoute, // ✅ This should be one `TradeRoute`
      slippage: 0.01,
    });
  
    console.log("✅ Transaction created:");
    console.dir(transaction, { depth: null });
  } catch (e) {
    console.error("❌ Failed to create transaction from route:", e);
  }
