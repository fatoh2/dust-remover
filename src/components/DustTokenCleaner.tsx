import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Spinner,
  Switch,
  Text,
} from "@radix-ui/themes";
import { COIN_DECIMALS, SLIPPAGE_OPTIONS } from "../constants";
import { fetchPrices, fetchPricesAM } from "../utils/pricing";
// import { mergeCoinObjects } from "../utils/sui";
import { TokenItem } from "./TokenItemV2";
import { SwapOrBurnDialog } from "./SwapOrBurnDialog";
import { executeSwapOrBurn } from "../helpers/executeSwapOrBurn";
import { Token } from "../types/Token";
import { TokenBalance } from "../types/TokenBalance";

// import { getBestSwapQuote } from "../utils/DexAggregator"; // Import the best swap quote function

export function DustTokenCleaner() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [dustOnly, setDustOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetSwapCoin, setTargetSwapCoin] = useState<"SUI" | "oSUI">("SUI");
  const [slippage, setSlippage] = useState("0.5");

  useEffect(() => {
    if (account) fetchTokens();
  }, [account, dustOnly]);

  async function fetchTokens() {
    setLoading(true);
    try {
      // const coins = await client.getAllCoins({ owner: account!.address });
      // console.log(coins);
      // const filtered = coins.data.filter((c) => Number(c.balance) > 0);

      const balanceResponse = await fetch("http://localhost:3001/api/get-balance")
      .then((res) => res.json())
      .then((data: TokenBalance[]) => {
        setTokens(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch token balances:", err);
        setLoading(false);
      });

      // const { balance } = balanceResponse.data.filter((c) => Number(c.balance) > 0);

      // console.log(balance);

      // const filtered = balance.data.filter((c) => Number(c.balance) > 0);

      // const grouped: Record<string, Token> = {};

      // for (const coin of filtered) {
      //   if (!grouped[coin.coinType]) {
      //     grouped[coin.coinType] = {
      //       coinType: coin.coinType,
      //       total: 0,
      //       objectIds: [],
      //     };
      //   }
      //   grouped[coin.coinType].total += Number(coin.balance);
      //   grouped[coin.coinType].objectIds.push(coin.coinObjectId);
      // }

      const coinTypes = Object.keys(grouped);
      // const metadataResults = await Promise.allSettled(
      //   coinTypes.map((type) => client.getCoinMetadata({ coinType: type }))
      // );

      const response = await fetch("http://localhost:3001/get-token-metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coinTypes }),
      });
      
      const { metadata } = await response.json();
      // console.log(metadata)
      const symbolsToFetch: string[] = [];
      const typesToFetch: string[] = [];
      
      metadata.forEach((meta) => {
        const token = grouped[meta.coinType];
        if (!token) return;
      
        if (!meta.error) {
          token.symbol = meta.symbol;
          token.logo = meta?.iconUrl || `/token-icons/${meta?.symbol?.toLowerCase()}.png`;
          if (meta.symbol) symbolsToFetch.push(meta.symbol.toLowerCase());
          if (meta.coinType) typesToFetch.push(meta.coinType);
        } else {
          console.warn(`Metadata fetch failed for ${meta.coinType}:`, meta.error);
        }
      });
      
      // const symbolsToFetch: string[] = [];

      // metadataResults.forEach((result, idx) => {
      //   if (result.status === "fulfilled") {
      //     const meta = result.value;
      //     const token = grouped[coinTypes[idx]];
      //     token.symbol = meta?.symbol;
      //     token.logo = meta?.iconUrl ?? `/fallback-icon.png`;
      //     if (meta?.symbol) symbolsToFetch.push(meta.symbol.toLowerCase());
      //   }
      // });

      const prices = await fetchPricesAM(typesToFetch);

      for (const token of Object.values(grouped)) {
        const coinType = token.coinType;
        if (coinType && prices[coinType]) {
          // console.log(coinType);
          // console.log(prices[coinType]);
          token.usd = (token.total / COIN_DECIMALS) * prices[coinType];
        }
      }

      let list = Object.values(grouped);
      if (dustOnly) list = list.filter((t) => t.total < 1_000_000);

      list.sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));
      setTokens(list);
    } catch (e) {
      console.error("Token fetch failed", e);
    } finally {
      setLoading(false);
    }
  }

  function toggle(coinType: string) {
    setSelected((prev) =>
      prev.includes(coinType)
        ? prev.filter((c) => c !== coinType)
        : [...prev, coinType]
    );
  }

  // async function trySwapOnly(txb: TransactionBlock, token: Token) {
  //   const coinArg = mergeCoinObjects(txb, token.objectIds);
  //   const amount = String(token.total);

  //   try {
  //     const bestQuote = await getBestSwapQuote(
  //       token.coinType,
  //       targetSwapCoin,
  //       Number(amount),
  //       slippage
  //     );

  //     if (!bestQuote || !bestQuote.route) {
  //       console.warn(`No valid swap path found for ${token.coinType}`);
  //       return;
  //     }

  //     // Now we use the properties of the bestQuote.route to build the transaction
  //     const route = bestQuote.route;

  //     // Build the swap transaction here based on route properties
  //     txb.moveCall({
  //       target: route.target, // The actual target address
  //       typeArguments: route.typeArguments || [], // Arguments that are required for the swap
  //       arguments: [coinArg, ...route.arguments], // Merge the token object with the rest of the arguments
  //     });
  //   } catch (e) {
  //     console.warn(`Swap failed for ${token.coinType}:`, e);
  //   }
  // }

  const handleSwap = () =>
    executeSwapOrBurn({
      account,
      selected,
      tokens,
      client,
      signAndExecuteTransaction,
      fetchTokens,
      setConfirmOpen,
    });

  if (!account) return null;

  return (
    <Box mt="5">
      <Flex justify="between" align="center" mb="2">
        <Heading>Dust Token Cleaner</Heading>
        <Flex gap="3" align="center">
          <Text size="1">Swap to</Text>
          <Select.Root value={targetSwapCoin} onValueChange={(v) => setTargetSwapCoin(v as any)}>
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="SUI">SUI</Select.Item>
              <Select.Item value="oSUI">oSUI</Select.Item>
            </Select.Content>
          </Select.Root>
          <Text size="1">Slippage</Text>
          <Select.Root value={slippage} onValueChange={setSlippage}>
            <Select.Trigger />
            <Select.Content>
              {SLIPPAGE_OPTIONS.map((s) => (
                <Select.Item key={s} value={s}>{s}%</Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
          <Text size="1">Show dust only</Text>
          <Switch checked={dustOnly} onCheckedChange={() => setDustOnly(!dustOnly)} />
        </Flex>
      </Flex>

      {loading ? (
        <Spinner />
      ) : tokens.length === 0 ? (
        <Text>No tokens found 🎉</Text>
      ) : (
        <>
          <table className="w-full table-auto border-collapse mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 text-left">Symbol</th>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Balance</th>
              <th className="p-2 text-left">USD</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-center">Select</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <TokenItem key={token.coinType} token={token} selected={selected} toggle={toggle} />
            ))}
          </tbody>
        </table>

          <SwapOrBurnDialog
            open={confirmOpen}
            onOpenChange={setConfirmOpen}
            onConfirm={handleSwap}
            count={selected.length}
            target={targetSwapCoin}
          />
        </>
      )}
    </Box>
  );
}
