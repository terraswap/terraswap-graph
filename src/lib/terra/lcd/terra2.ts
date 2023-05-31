import axios, { AxiosResponse } from 'axios'
import * as http from 'http';
import * as https from 'https';
import { isNative } from 'lib/utils';
import { Lcd, PoolInfo, TokenInfo } from './interfaces';


export class Terra2Lcd implements Lcd {
    private lcdUrl = process.env.TERRA_LCD || 'https://phoenix-lcd.terra.dev'
    private assetInfoUrl = "https://assets.terra.money/ibc/tokens.json"

    private client = axios.create({
        httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
        httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
        timeout: 2 * 1000,
    })
    private async getLatestBlockHeightLegacy(): Promise<number> {
        try {
            const res = await this.client.get(`${this.lcdUrl}/blocks/latest`)
            return parseInt(res.data.block.header.height)
        } catch (err) {
            throw new Error(`latestBlockHeight: ${err}`)
        }
    }

    async getLatestBlockHeight(): Promise<number> {
        try {
            const res = await this.client.get(`${this.lcdUrl}/cosmos/base/tendermint/v1beta1/blocks/latest`)
            return parseInt(res.data.block.header.height)
        } catch (err) {
            return await this.getLatestBlockHeightLegacy()
        }
    }
    async getTokenInfo(address: string): Promise<TokenInfo> {
        return isNative(address) ? await this.getNativeTokenInfo(address) : await this.getCw20Info(address)
    }

    async getPoolInfo(address: string, height?: number): Promise<PoolInfo> {
        let headers = {}
        if (height) {
            headers = { 
                'x-cosmos-block-height': height,
            }
        }

        const query_data = Buffer.from('{"pool":{}}').toString("base64")
        const result = await this.client.get(`${this.lcdUrl}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`, {
            headers
        })
        return result.data?.data
    }

    private async getNativeTokenInfo(denom: string): Promise<TokenInfo> {
        if (denom == "uluna") {
            return {
                symbol: "uluna",
                decimals: 6
            }
        }
        const key = denom.includes("ibc/") ? denom.split("/")[1] : denom
        const result: AxiosResponse<AssetInfoRes> = await this.client.get(`${this.assetInfoUrl}`)
        const list = result.data.mainnet
        return {
            symbol: list[key].symbol,
            decimals: list[key]?.decimals ?? 6
        }
    }

    private async getCw20Info(address: string): Promise<TokenInfo> {
        const query_data = Buffer.from('{"token_info":{}}').toString("base64")
        const result = await this.client.get(`${this.lcdUrl}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`)
        return result.data?.data
    }
}


interface AssetInfoRes {
    mainnet: TokenInfoRes
    classic: TokenInfoRes
    testnet: TokenInfoRes
}

interface TokenInfoRes {
    [key: string]: {
        denom: string
        path: string
        base_denom: string
        symbol: string
        name: string
        icon: string
        decimals?: number
    }
}