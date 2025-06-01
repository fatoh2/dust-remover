import { useSuiClientContext } from "@mysten/dapp-kit";
import { Select, Flex, Text } from "@radix-ui/themes";

export function NetworkSelector() {
	const { network, networks, selectNetwork } = useSuiClientContext();

	return (
		<Flex align="center" gap="2">
			<Text size="1">Network</Text>
			<Select.Root value={network} onValueChange={selectNetwork}>
				<Select.Trigger />
				<Select.Content>
					{Object.keys(networks).map((net) => (
						<Select.Item key={net} value={net}>
							{net}
						</Select.Item>
					))}
				</Select.Content>
			</Select.Root>
		</Flex>
	);
}
