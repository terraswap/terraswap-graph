import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import * as http from 'http';
import * as https from 'https';
import { ClassicFcdContractMsgSenderRes, fcd } from './interfaces';


export class ClassicFcd implements fcd {
    private url = process.env.TERRA_FCD || 'http://localhost:8080'
    private client: AxiosInstance;

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
        this.client = axios.create({
            ...defaultConfig,
            ...config,
        })
    }


    async getContractMsgSender(hash: string, contract: string): Promise<string> {
        try {
            const result = await this.client.get<ClassicFcdContractMsgSenderRes>(`${this.url}/v1/tx/${hash}`)
            let sender: string;
            let found = false;
            for (let i = 0; i < result.data?.tx?.value?.msg.length && !found; i++) {
                const msg = result.data?.tx?.value.msg[i]
                // maybe this msg execute the contract
                if (!found && msg["type"]?.includes("Contract")) {
                    sender = msg.value.sender
                }
                // contract direct msg
                if (msg.value.contract === contract) {
                    sender = msg.value.sender
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

