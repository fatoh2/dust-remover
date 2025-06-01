import { Aftermath } from "aftermath-ts-sdk";

// Initialize SDK
const afSdk = new Aftermath("MAINNET");

await afSdk.init(); // Required before using anything

const prices = afSdk.Prices();

/**
 * Fetch USD prices for given token symbols using Aftermath.
 */
export async function fetchPricesAM(symbols: string[]): Promise<Record<string, number>> {
	try {
        const formatted: string[] = symbols.map(s => s);
        console.log(formatted)
		const multiPrices = await prices.getCoinsToPrice({
            coins: formatted
        });
        console.log(multiPrices)
        return await multiPrices;
        } catch (e) {
            console.error("Price fetch failed", e);
            return {};
        }
}
