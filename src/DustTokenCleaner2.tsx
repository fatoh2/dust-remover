// DustTokenCleaner.tsx — with Cetus aggregator + merge + slippage + burn confirm

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
    Checkbox,
    Dialog,
    Flex,
    Heading,
    Select,
    Spinner,
    Switch,
    Text,
    AlertDialog,
  } from "@radix-ui/themes";
  
  const COIN_DECIMALS = 1e9;
  const TARGET_COINS = {
    SUI: "0x2::sui::SUI",
    oSUI: "0x123...::osui::OSUI", // Replace with actual oSUI type
  };
  
  const CETUS_QUOTE_URL = "https://api-sui.cetus.zone/v2/swap/quote";
  
  export function DustTokenCleaner() {
    const account = useCurrentAccount();
    const client = useSuiClient();
    const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();
  
    const [tokens, setTokens] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<string[]>([]);
    const [dustOnly, setDustOnly] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmBurnList, setConfirmBurnList] = useState<string[]>([]);
    const [targetSwapCoin, setTargetSwapCoin] = useState<"SUI" | "oSUI">("SUI");
    const [slippage, setSlippage] = useState("0.5");
  
    const isConnected = !!account;
  
    useEffect(() => {
      if (!account) return;
      fetchTokens();
    }, [account, client, dustOnly]);
  
    async function fetchTokens() {
      setLoading(true);
      try {
        const coins = await client.getAllCoins({ owner: account!.address });
        const filtered = coins.data.filter((c) => Number(c.balance) > 0);
  
        const grouped: Record<string, any> = {};
        for (const coin of filtered) {
          if (!grouped[coin.coinType]) {
            grouped[coin.coinType] = {
              coinType: coin.coinType,
              total: 0,
              objectIds: [],
            };
          }
          grouped[coin.coinType].total += Number(coin.balance);
          grouped[coin.coinType].objectIds.push(coin.coinObjectId);
        }
  
        const coinTypes = Object.keys(grouped);
        const metadataResults = await Promise.allSettled(
          coinTypes.map((type) => client.getCoinMetadata({ coinType: type }))
        );
  
        const symbolsToFetch: string[] = [];
  
        metadataResults.forEach((result, idx) => {
          if (result.status === "fulfilled") {
            const metadata = result.value;
            const token = grouped[coinTypes[idx]];
            if (metadata) {
              token.symbol = metadata.symbol ?? undefined;
              token.logo = metadata.iconUrl ?? undefined;
              if (metadata.symbol) symbolsToFetch.push(metadata.symbol.toLowerCase());
            }
          }
        });
  
        const prices = await fetchPrices(symbolsToFetch);
        for (const token of Object.values(grouped)) {
          const id = token.symbol?.toLowerCase();
          if (id && prices[id]?.usd) {
            token.usd = (token.total / COIN_DECIMALS) * prices[id].usd;
          }
        }
  
        let list = Object.values(grouped);
        if (dustOnly) list = list.filter((t) => t.total < 1_000_000);
  
        list.sort((a, b) => (b.usd ?? 0) - (a.usd ?? 0));
        setTokens(list);
      } catch (e) {
        console.error("Token fetch error", e);
      } finally {
        setLoading(false);
      }
    }
  
    async function fetchPrices(symbols: string[]) {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${symbols.join(",")}&vs_currencies=usd`
        );
        return await res.json();
      } catch {
        return {};
      }
    }
  
    function toggle(coinType: string) {
      setSelected((prev) =>
        prev.includes(coinType)
          ? prev.filter((c) => c !== coinType)
          : [...prev, coinType]
      );
    }
  
    async function trySwap(txb: TransactionBlock, token: any): Promise<"swapped" | "no-route"> {
        const inputCoinType = token.coinType;
        const outputCoinType = TARGET_COINS[targetSwapCoin];
        const amount = token.total.toString();
    
        const quoteUrl = `${CETUS_QUOTE_URL}?inputCoinType=${encodeURIComponent(inputCoinType)}&outputCoinType=${encodeURIComponent(outputCoinType)}&amount=${amount}&slippage=${slippage}`;
        try {
          const res = await fetch(quoteUrl);
          if (!res.ok) throw new Error("Failed to fetch swap quote");
          const data = await res.json();
    
          if (!data.data || !data.data.routes?.length) return "no-route";
    
          // Merge coins
          const [primary, ...rest] = token.objectIds;
          if (rest.length) {
            txb.mergeCoins(txb.object(primary), rest.map((id: any) => txb.object(id)));
          }
    
          // Execute swap (this assumes route is encoded as a move call on-chain, for simplicity)
          // You can expand this with full swapTx using Cetus SDK or raw move calls
          txb.moveCall({
            target: data.data.routes[0].steps[0].call, // e.g. "0x...::pool::swap"
            arguments: data.data.routes[0].steps[0].arguments.map((arg: any) =>
              arg.startsWith("0x") ? txb.object(arg) : txb.pure(arg)
            ),
            typeArguments: data.data.routes[0].steps[0].types,
          });
    
          return "swapped";
        } catch (e) {
          console.warn(`Swap failed: ${e}`);
          return "no-route";
        }
      }
    
      async function swapOrBurn() {
        if (!selected.length || !account) return;
    
        const txb = new TransactionBlock();
        const tokensToBurn: any[] = [];
    
        for (const type of selected) {
          const token = tokens.find((t) => t.coinType === type);
          if (!token) continue;
    
          const result = await trySwap(txb, token);
          if (result === "no-route") {
            tokensToBurn.push(token);
          }
        }
    
        if (tokensToBurn.length > 0) {
          setConfirmBurnList(tokensToBurn);
          return; // wait for confirmation before adding burns
        }
    
        await finalizeTransaction(txb);
      }
    
      async function finalizeTransaction(txb: TransactionBlock) {
        try {
            await signAndExecuteTransaction({ transactionBlock: txb });

          setConfirmOpen(false);
          setConfirmBurnList([]);
          fetchTokens();
        } catch (e) {
          console.error("Transaction failed:", e);
          alert("Action failed.");
        }
      }
    
      async function confirmBurnAndSend() {
        const txb = new TransactionBlock();
        for (const token of confirmBurnList) {
          const [primary, ...rest] = token.objectIds;
          if (rest.length) {
            txb.mergeCoins(txb.object(primary), rest.map((id: any) => txb.object(id)));
          }
          txb.moveCall({
            target: "0x2::coin::burn",
            arguments: [txb.object(primary)],
          });
        }
        await finalizeTransaction(txb);
      }
    
      if (!isConnected) return null;
    
      return (
        <Box mt="5">
          <Flex justify="between" align="center" mb="2">
            <Heading>Dust Token Cleaner</Heading>
            <Flex gap="3" align="center">
              <Text size="1">Swap to</Text>
              <Select.Root value={targetSwapCoin} onValueChange={(val) => setTargetSwapCoin(val as "SUI" | "oSUI")}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="SUI">SUI</Select.Item>
                  <Select.Item value="oSUI">oSUI</Select.Item>
                </Select.Content>
              </Select.Root>
    
              <Text size="1">Slippage</Text>
              <Select.Root value={slippage} onValueChange={(val) => setSlippage(val)}>
                <Select.Trigger />
                <Select.Content>
                  <Select.Item value="0.1">0.1%</Select.Item>
                  <Select.Item value="0.5">0.5%</Select.Item>
                  <Select.Item value="1.0">1.0%</Select.Item>
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
            <Flex direction="column" gap="2">
              {tokens.map((token) => (
                <Flex
                  key={token.coinType}
                  justify="between"
                  align="center"
                  px="3"
                  py="2"
                  style={{ background: "var(--gray-a3)", borderRadius: 6 }}
                >
                  <Flex gap="3" align="center">
                    {token.logo && (
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        width={24}
                        height={24}
                        style={{ borderRadius: 4 }}
                        onError={(e) => ((e.target as HTMLImageElement).src = "/fallback-icon.png")}
                      />
                    )}
                    <Text size="2">
                      {token.symbol ?? token.coinType.split("::")[2]} — {(token.total / COIN_DECIMALS).toFixed(6)} —{" "}
                      {token.usd && <>${token.usd.toFixed(2)} USD</>} — {token.objectIds.length} coins
                    </Text>
                  </Flex>
                  <Checkbox
                    checked={selected.includes(token.coinType)}
                    onCheckedChange={() => toggle(token.coinType)}
                  />
                </Flex>
              ))}
    
              <Dialog.Root open={confirmOpen} onOpenChange={setConfirmOpen}>
                <Dialog.Trigger>
                  <Button mt="3" color="red" disabled={!selected.length}>
                    Swap Selected
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content>
                  <Dialog.Title>Confirm Swap</Dialog.Title>
                  <Dialog.Description>
                    Attempt to swap selected tokens to {targetSwapCoin}. If no route is found, you’ll be asked before burning.
                  </Dialog.Description>
                  <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                      <Button variant="soft" color="gray">
                        Cancel
                      </Button>
                    </Dialog.Close>
                    <Button color="red" onClick={swapOrBurn}>
                      Confirm
                    </Button>
                  </Flex>
                </Dialog.Content>
              </Dialog.Root>
    
              {confirmBurnList.length > 0 && (
                <AlertDialog.Root open>
                  <AlertDialog.Content>
                    <AlertDialog.Title>Burn Unswappable Tokens?</AlertDialog.Title>
                    <AlertDialog.Description>
                      No swap route was found for the following tokens. Do you want to burn them?
                      <ul>
                        {confirmBurnList.map((t) => (
                          <li key={t.coinType}>
                            {t.symbol ?? t.coinType.split("::")[2]} — {t.objectIds.length} coins
                          </li>
                        ))}
                      </ul>
                    </AlertDialog.Description>
                    <Flex gap="3" mt="4" justify="end">
                      <AlertDialog.Cancel>
                        <Button variant="soft" color="gray" onClick={() => setConfirmBurnList([])}>
                          Cancel
                        </Button>
                      </AlertDialog.Cancel>
                      <Button color="red" onClick={confirmBurnAndSend}>
                        Burn & Send
                      </Button>
                    </Flex>
                  </AlertDialog.Content>
                </AlertDialog.Root>
              )}
            </Flex>
          )}
        </Box>
      );
    }
    