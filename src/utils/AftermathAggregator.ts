import { Aftermath } from "aftermath-ts-sdk"

const afSdk = new Aftermath("MAINNET"); // "MAINNET" | "TESTNET"
await afSdk.init(); // initialize provider

const WALLET_ADDRESS = '0xcbad5bf114640f7b956ec3d70498bd8ad9967c587dddb7b52f3ec62e684b06db';
// Access protocols
const router = afSdk.Router();
// const pools = afSdk.Pools();
const prices = afSdk.Prices();

const volume = await router.getVolume24hrs();
console.log(volume); // Returns a number representing total 24h volume
// const supportedCoins = await router.getSupportedCoins();
// console.log(supportedCoins)

// supportedCoins.forEach((coin, index) => {
//     // console.log(`Item ${index}: ${coin}`);
//     if (coin.includes("wal::WAL")) {
//         console.log(coin)
//     }
//   });
// // Get a trade route
// try {
//     const route = await router.getCompleteTradeRouteGivenAmountIn({
//       coinInType: "0x2::sui::SUI",
//       coinOutType: "0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL",
//       coinInAmount: BigInt(200_000_000),
//     //   referrer: "0x...",
//     });
  
//     console.log(route);
    
//     const tx = await router.getTransactionForCompleteTradeRoute({
//       walletAddress: "0xcbad5bf114640f7b956ec3d70498bd8ad9967c587dddb7b52f3ec62e684b06db",
//       completeRoute: route,
//       slippage: 1,
//     });
  
//     console.log(tx);
//   } catch (err) {
//     console.error("Aftermath SDK error:", err.message || err);
//   }
  
// Find first route (SUIP -> SUI)
const completeRoute = await router.getCompleteTradeRouteGivenAmountIn({
	coinInAmount: BigInt("2000000000"),
	coinInType:
		"0xe4239cd951f6c53d9c41e25270d80d31f925ad1655e5ba5b543843d4a66975ee::SUIP::SUIP",
	coinOutType: "0x2::sui::SUI",
});

// Create transaction and add first trade
// const tx = new Transaction();
// const { tx: newTx, coinOutId } =
// 	await router.addTransactionForCompleteTradeRoute({
// 		tx,
// 		completeRoute,
// 		slippage: 0.1,
// 		walletAddress: WALLET_ADDRESS,
// 	});

// Transfer first trade output
// newTx.transferObjects([coinOutId!], WALLET_ADDRESS);

// Get price info for SUI
const suiPriceInfo = await prices.getCoinPriceInfo({
	coin: "0x2::sui::SUI",
});

const formatted = ["0x2::sui::SUI",
    "0x3b68324b392cee9cd28eba82df39860b6b220dc89bdd9b21f675d23d6b7416f1::kdx::KDX",
    "0x7016aae72cfc67f2fadf55769c0a7dd54291a583b63051a5ed71081cce836ac6::sca::SCA",
    "0x2053d08c1e2bd02791056171aab0fd12bd7cd7efad2ab8f6b9c8902f14df2ff2::ausd::AUSD",
    "0x5d4b302506645c37ff133b98c4b50a5ae14841659738d6d733d59d0d217a93bf::coin::COIN",
    "0x87bbaf503d2732c15fca757d6f8cb6e6233c97e8af90c93ab18593fecbc25ecb::usdc::USDC",
    "0xa99b8952d4f7d947ea77fe0ecdcc9e5fc0bcab2841d6e2a5aa00c3044e5544b5::navx::NAVX",
    "0xda79c0756319ea12c1679cb0d2c9fa85c66c0c724f45b7d1af0f7ed79fe4573d::suiz::SUIZ",
    "0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC"]
// Get prices for multiple coins
const multiPrices = await prices.getCoinsToPrice({
	coins: formatted
});

console.log(`SUI Price: $${suiPriceInfo.price}`);
console.log(multiPrices);