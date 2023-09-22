import { AxiosInstance } from "axios";
import { ExchangeRate } from "types";
import { Oracle } from "./interfaces";

export class MainnetOracle implements Oracle {
    private readonly USX_ADDR = process.env.STABLE_COIN_ADDR;
    private url = process.env.TERRA_LCD || "http://localhost:1317"
    private client: AxiosInstance

    constructor(client: AxiosInstance) {
        this.url = client.defaults.baseURL || this.url
        this.client = client
    }

    async getExchangeRate(height: number): Promise<ExchangeRate> {
        return undefined
    }

    async exchangeRateToUSX(denom: string, inputExchangeRate: ExchangeRate): Promise<string> {
        return
    }
}
