import { Container, Flex, Heading } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";

import { WalletStatus } from "./components/WalletStatus";
import { NetworkSelector } from "./components/NetworkSelector";
import { DustTokenCleaner } from "./components/DustTokenCleaner";

export default function App() {
	return (
		<>
			<Flex
				position="sticky"
				px="4"
				py="2"
				justify="between"
				style={{ borderBottom: "1px solid var(--gray-a2)" }}
			>
				<Heading>Dust Remover</Heading>

				<Flex gap="4" align="center">
					<NetworkSelector />
					<ConnectButton />
				</Flex>
			</Flex>

			<Container mt="5">
				<WalletStatus />
				<DustTokenCleaner />
			</Container>
		</>
	);
}
