// src/utils/dexAggregator.ts
import { getCetusQuote } from './cetus'; // Function to get quotes from Cetus
import { getFlowXQuote } from './flowX'; // Hypothetical function for FlowX quotes

// Define types for quotes from different aggregators
type SwapQuote = {
  price: number;
  route: string;
  inputAmount: number;
  outputAmount: number;
};

export async function getBestSwapQuote(
  fromToken: string,
  toToken: string,
  amount: number,
  slippage: string
): Promise<SwapQuote | null> {
  try {
    // Get quotes from different DEX aggregators
    const cetusQuote = await getCetusQuote(fromToken, toToken, amount, slippage);
    const flowXQuote = await getFlowXQuote(fromToken, toToken, amount, slippage);

    // Compare quotes from multiple aggregators
    if (!cetusQuote && !flowXQuote) {
      throw new Error('No valid swap routes found');
    }

    let bestQuote: SwapQuote | null = null;

    // Compare the quotes based on price or other criteria
    if (cetusQuote && flowXQuote) {
      bestQuote = cetusQuote.price > flowXQuote.price ? cetusQuote : flowXQuote;
    } else {
      bestQuote = cetusQuote || flowXQuote;
    }

    return bestQuote;
  } catch (error) {
    console.error('Error fetching best swap quote:', error);
    return null;
  }
}
