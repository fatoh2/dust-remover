import { Checkbox, Flex, Text } from "@radix-ui/themes";

type Props = {
	token: {
        coinName: string;
		coinType: string;
        coinSymbol: string;
		total: number;
        balance: number;
		objectIds: string[];
		logo?: string;
		balanceUsd?: number | null;
        decimals: number;
        coinPrice: number | null;  
	};
	selected: string[];
	toggle: (coinType: string) => void;
};

export function TokenItem({ token, selected, toggle }: Props) {
	return (
		<Flex
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
						alt={token.coinSymbol ?? token.coinType}
						width={24}
						height={24}
						style={{ borderRadius: 4 }}
						onError={(e) =>
							((e.target as HTMLImageElement).src = `/token-icons/${token.coinSymbol?.toLowerCase()}.png`)
						}
					/>
				)}
				<Text size="2">
                    {token.coinName} —{" "}
                    {token.coinSymbol} —{" "}
					{/* {(token.total / 1e6).toFixed(6)} {token.coinSymbol} -{" "} */}
                    {token.balance} {token.coinSymbol} —{" "}
                    {token.balanceUsd && <> (~${token.balanceUsd.toFixed(10)})</>} —{" "}
                    {token.coinPrice?.toFixed(3) ?? 'N/A'}$
					{/* {token.objectIds.length} coins */}
				</Text>
			</Flex>
			<Checkbox
				checked={selected.includes(token.coinType)}
				onCheckedChange={() => toggle(token.coinType)}
			/>
		</Flex>
	);
}
