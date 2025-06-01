// src/utils/flowX.ts
import { CoinProvider, AggregatorQuoter } from "@flowx-finance/sdk";

const coinProv = new CoinProvider()
const coins = await coinProv.getCoins({
    coinTypes: ['0x2::sui::SUI','0x5a71532c1e812daeffd07ef375451fad7a2906d01151bade4d5018ffc5a3c267::o_sui::O_SUI'],
  });

console.log(coins)

const quoter = new AggregatorQuoter('mainnet');
const params: AggregatorQuoterQueryParams = {
  tokenIn: '0x2::sui::SUI',
  tokenOut: '0x5a71532c1e812daeffd07ef375451fad7a2906d01151bade4d5018ffc5a3c267::o_sui::O_SUI',
//   tokenOut: '0x356a26eb9e012a68958082340d4c4116e7f55615cf27affcff209cf0ae544f59::wal::WAL',
  amountIn: '1000000000',
  includeSources: null, //optional
  excludeSources: null, //optional
  commission: null, //optional, and will be explain later
  maxHops: null, //optional: default and max is 3
  splitDistributionPercent: null, //optional: default 1 and max 100
  excludePools: null, //optional: list pool you want excude example: 0xpool1,0xpool2 
};

const routes = await quoter.getRoutes(params);
console.log(routes.routes)
// export async function getFlowXQuote(
//   fromToken: string,
//   toToken: string,
//   amount: number,
//   slippage: string
// ) {
//   try {
//     // FlowX SDK expects the amount to be passed as a string
//     const quote = await getQuote({
//       from: fromToken,
//       to: toToken,
//       amount: amount.toString(),
//       slippage: parseFloat(slippage), // slippage should be a decimal value
//     });

//     if (!quote || !quote.price) {
//       console.warn('No valid quote received from FlowX');
//       return null;
//     }

//     return {
//       price: quote.price,
//       route: quote.route,  // The route or the path of the swap
//       inputAmount: amount,
//       outputAmount: quote.outputAmount,
//     };
//   } catch (error) {
//     console.error('Error fetching quote from FlowX:', error);
//     return null;
//   }
// }
