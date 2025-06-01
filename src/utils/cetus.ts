// src/utils/cetus.ts
export async function getCetusQuote(
    inputCoinType: string,
    outputCoinType: string,
    amount: number,
    slippage: string
  ) {
    const apiUrl = 'https://api-sui.cetus.zone/v2/swap/quote';
    
    const params = new URLSearchParams({
      inputCoinType,
      outputCoinType,
      amount: amount.toString(),
      slippage,
      swapType: '1',  // assuming swapType is required (check API docs)
    });
  
    try {
      const response = await fetch(`${apiUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Error fetching quote from Cetus: ${response.statusText}`);
      }
  
      const quoteData = await response.json();
      
      return {
        price: parseFloat(quoteData.price),
        route: quoteData.route,
        inputAmount: amount,
        outputAmount: parseFloat(quoteData.outputAmount),
      };
    } catch (error) {
      console.error('Error fetching quote from Cetus:', error);
      return null;
    }
  }
  