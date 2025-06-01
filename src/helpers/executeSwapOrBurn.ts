import { TransactionBlock } from "@mysten/sui.js/transactions";
import { SuiClient } from "@mysten/sui.js/client";
import { toast } from "sonner";
// import { mergeCoinObjects } from "../utils/sui";
import { Token } from "../types/Token.ts";

interface ExecuteSwapOrBurnParams {
  account: { address: string } | null;
  selected: string[];
  tokens: Token[];
  client: SuiClient;
  signAndExecuteTransaction: (params: { transaction: string }) => Promise<any>;
  fetchTokens: () => Promise<void>;
  setConfirmOpen: (value: boolean) => void;
}

export async function executeSwapOrBurn({
  account,
  selected,
  tokens,
  signAndExecuteTransaction,
  fetchTokens,
  setConfirmOpen,
}: ExecuteSwapOrBurnParams) {
  if (!account || !selected.length) return;

  const txb = new TransactionBlock();

  // Placeholder for future swap logic:
  // for (const type of selected) {
  //   const token = tokens.find((t) => t.coinType === type);
  //   if (!token) continue;
  //   const coinArg = mergeCoinObjects(txb, token.objectIds);
  //   // Add swap logic here using moveCall etc.
  // }

  try {
    await signAndExecuteTransaction({ transaction: txb.serialize() });
    setConfirmOpen(false);
    toast.success("Swap completed.");
    await fetchTokens();
  } catch (e) {
    console.error("Transaction failed", e);
    toast.error("Transaction failed.");
  }
}
