export type TokenBalance = {
    coinType: string;
    coinName: string;
    coinSymbol: string;
    balance: number;
    balanceUsd: number | null;
    decimals: number;
    coinPrice: number | null;
  };