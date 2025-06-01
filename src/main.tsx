import React from "react";
import ReactDOM from "react-dom/client";
import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";

import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	SuiClientProvider,
	WalletProvider,
	lightTheme,
} from "@mysten/dapp-kit";

import App from "./App";
import { networkConfig } from "./networkConfig";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Theme appearance="dark">
			<QueryClientProvider client={queryClient}>
				<SuiClientProvider networks={networkConfig} defaultNetwork="mainnet">
					<WalletProvider autoConnect theme={lightTheme}>
						<App />
					</WalletProvider>
				</SuiClientProvider>
			</QueryClientProvider>
		</Theme>
	</React.StrictMode>
);
