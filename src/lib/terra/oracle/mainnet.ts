import * as http from 'http';
import * as https from 'https';

import axios, { Axios } from "axios";
import { ExchangeRate } from "types";
import { Oracle } from "./interfaces";

export class MainnetOracle implements Oracle {
    private readonly USX_ADDR = process.env.STABLE_COIN_ADDR;
    private axios: Axios;
    constructor(lcdUrl = process.env.TERRA_LCD) {
        this.axios = axios.create({
            baseURL: lcdUrl,
            httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
            httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
            timeout: 2 * 1000,
        })
    }
    async getExchangeRate(height: number): Promise<ExchangeRate> {
        return undefined
    }

    async exchangeRateToUSX(denom: string, inputExchangeRate: ExchangeRate): Promise<string> {
        return
    }
}
