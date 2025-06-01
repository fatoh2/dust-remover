import { Aftermath } from "aftermath-ts-sdk"

const afSdk = new Aftermath("MAINNET");
await afSdk.init(); // initialize provider

const prices = afSdk.Prices();

/**
 * Fetch USD prices for given token symbols using CoinGecko.
 */
export async function fetchPrices(symbols: string[]): Promise<Record<string, { usd: number }>> {
	try {
		const ids = symbols.map((s) => s.toLowerCase()).join(",");
		const res = await fetch(
			`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`
		);
		if (!res.ok) throw new Error("Failed to fetch prices");
        // console.log(res.json());
		return await res.json();
	} catch (e) {
		console.error("Price fetch failed", e);
		return {};
	}
}

export async function fetchPricesAM(symbols: string[]): Promise<Record<string, number >> {
	try {
        const formatted: string[] = symbols.map(s => s);
        // console.log(formatted)
		const multiPrices = await prices.getCoinsToPrice({
            coins: formatted
        });
        // console.log(multiPrices)
        return await multiPrices;
        } catch (e) {
            console.error("Price fetch failed", e);
            return {};
        }
}