import { AxiosInstance, AxiosResponse } from 'axios'
import { isNative } from 'lib/utils';
import { Lcd, LcdContractMsgSenderRes, PoolInfo, TokenInfo } from './interfaces';


export class MainnetLcd implements Lcd {
    private assetInfoUrl = "https://assets.terra.money/ibc/tokens.json"
    private url = process.env.TERRA_LCD || 'https://phoenix-lcd.terra.dev'
    private client: AxiosInstance

    constructor(client: AxiosInstance) {
        this.url = client.defaults.baseURL || this.url
        this.client = client
    }


    async getLatestBlockHeight(): Promise<number> {
        try {
            const res = await this.client.get(`${this.url}/cosmos/base/tendermint/v1beta1/blocks/latest`)
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
        const result = await this.client.get(`${this.url}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`, {
            headers
        })
        return result.data?.data
    }

    async getContractMsgSender(hash: string, contract: string): Promise<string> {
        try {
            const result = await this.client.get<LcdContractMsgSenderRes>(`${this.url}/cosmos/tx/v1beta1/txs/${hash}`)
            let sender: string;
            let found = false;
            for (let i = 0; i < result.data?.tx?.body?.messages.length && !found; i++) {
                const msg = result.data?.tx?.body?.messages[i]
                // maybe this msg execute the contract
                if (!found && msg["@type"]?.includes("Contract")) {
                    sender = msg.sender
                }
                // contract direct msg
                if (msg.contract === contract) {
                    sender = msg.sender
                    found = true
                }
            }
            return sender
        } catch (err: any) {
            if (err.isAxiosError && err.response?.status === 500) {
                const res = err.response.data
                if (res.code !== 0 && res.message?.includes('contract query failed: unknown request')) {
                    return undefined
                }
            }
            throw err
        }
    }

    private async getLatestBlockHeightLegacy(): Promise<number> {
        try {
            const res = await this.client.get(`${this.url}/blocks/latest`)
            return parseInt(res.data.block.header.height)
        } catch (err) {
            throw new Error(`latestBlockHeight: ${err}`)
        }
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
        const result = await this.client.get(`${this.url}/cosmwasm/wasm/v1/contract/${address}/smart/${query_data}`)
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