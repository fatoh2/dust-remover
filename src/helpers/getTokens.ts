import {
    useCurrentAccount,
    useSignAndExecuteTransaction,
    useSuiClient,
  } from "@mysten/dapp-kit";

const account = useCurrentAccount();
const client = useSuiClient();

const coins = await client.getAllCoins({ owner: account!.address });