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
		<tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
			<td className="p-2">
				<Flex gap="2" align="center">
					{/* {token.logo && (
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
					)} */}
					<Text size="2" weight="medium">
						{token.coinSymbol}
					</Text>
				</Flex>
			</td>
			<td className="p-2">
				<Flex gap="2" align="center">
					<Text size="2">{token.coinName}</Text>
				</Flex>
			</td>
			<td className="p-2">
				<Flex gap="2" align="center">
					<Text size="2">{token.balance.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}</Text>
				</Flex>
			</td>
			<td className="p-2">
				<Flex gap="2" align="center">
					<Text size="2">
						{token.balanceUsd !== null
							? `$${token.balanceUsd?.toFixed(4)}`
							: "N/A"}
					</Text>
				</Flex>
			</td>
			<td className="p-2">
				<Flex gap="2" align="center">
					<Text size="2">
						{token.coinPrice !== null ? `$${token.coinPrice.toFixed(3)}` : "N/A"}
					</Text>
				</Flex>
			</td>
			<td className="p-2 text-center">
				<Flex gap="2" align="center">
					<Checkbox
						checked={selected.includes(token.coinType)}
						onCheckedChange={() => toggle(token.coinType)}
					/>
				</Flex>
			</td>
		</tr>
	);
}
