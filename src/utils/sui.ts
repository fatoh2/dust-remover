import { TransactionBlock, TransactionArgument } from "@mysten/sui.js/transactions";

/**
 * Merge multiple coin object IDs into a single coin using TransactionBlock.
 */
export function mergeCoinObjects(
	txb: TransactionBlock,
	coinIds: string[]
): TransactionArgument {
	if (coinIds.length === 1) return txb.object(coinIds[0]);

	const [primary, ...others] = coinIds;
	const primaryObj = txb.object(primary);
	const mergeObjs = others.map((id) => txb.object(id));

	txb.mergeCoins(primaryObj, mergeObjs);
	return primaryObj; // This represents the merged Coin<T>
}

/**
 * Build a burn instruction into the transaction block.
 * Ensure both the coin argument and the type argument are provided.
 */
export function burnCoin(
	txb: TransactionBlock,
	coin: TransactionArgument,
	coinType: string
) {
	txb.moveCall({
		target: "0x2::coin::burn",
		typeArguments: [coinType],
		arguments: [coin],
	});
}
