import { AxiosRequestConfig } from 'axios'
import { Lcd, PoolInfo, TokenInfo } from '../interfaces';
import { ClassicCosmos46Lcd } from './classic.cosmos46';
import { ClassicLegacyLcd } from './classic.legacy';

export class ClassicLcd implements Lcd {
    private clients: Lcd[];
    private indicator = 0;
    constructor(url?: string, config?: AxiosRequestConfig) {
        this.clients = [
            new ClassicCosmos46Lcd(url, config),
            new ClassicLegacyLcd(url, config)
        ]
    }
    async getLatestBlockHeight(): Promise<number> {
        try {
            return await this.clients[this.indicator].getLatestBlockHeight()
        } catch (err) {
            this.indicator = (this.indicator + 1) % this.clients.length
            return await this.clients[this.indicator].getLatestBlockHeight()
        }
    }
    async getTokenInfo(address: string): Promise<TokenInfo> {
        try {
            return await this.clients[this.indicator].getTokenInfo(address)
        } catch (err) {
            this.indicator = (this.indicator + 1) % this.clients.length
            return await this.clients[this.indicator].getTokenInfo(address)
        }
    }
    async getPoolInfo(address: string, height?: number): Promise<PoolInfo> {
        try {
            return await this.clients[this.indicator].getPoolInfo(address, height)
        } catch (err) {
            this.indicator = (this.indicator + 1) % this.clients.length
            return await this.clients[this.indicator].getPoolInfo(address, height)
        }
    }
    async getContractMsgSender(hash: string, contract: string): Promise<string> {
        try {
            return await this.clients[this.indicator].getContractMsgSender(hash, contract)
        } catch (err) {
            this.indicator = (this.indicator + 1) % this.clients.length
            return await this.clients[this.indicator].getContractMsgSender(hash, contract)
        }
    }
}
