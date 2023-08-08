import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as http from 'http';
import * as https from 'https';
import { FcdContractMsgSenderRes, fcd } from './interfaces';


export class Fcd implements fcd {

    private url = process.env.TERRA_FCD || 'http://localhost:8080'

    private fcd: AxiosInstance;

    constructor(url?: string, config?: AxiosRequestConfig) {
        if (url) {
            this.url = url
        }
        const defaultConfig = {
            baseURL: this.url,
            httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
            httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
            timeout: 10 * 1000,
        }
        this.fcd = axios.create({
            ...defaultConfig,
            ...config,
        })
    }


    async getContractMsgSender(hash: string, contract: string): Promise<string> {
        try {
            const result = await this.fcd.get<FcdContractMsgSenderRes>(`${this.url}/v1/tx/${hash}`)
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
}

