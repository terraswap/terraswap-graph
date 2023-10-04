import * as logger from 'lib/logger'
import { isClassic } from ".."
import { Lcd } from "./interfaces"
import { MainnetLcd } from "./mainnet"
import initClassicLcd, { classicLcd } from './classic';
import { AxiosInstance } from 'axios';

export let lcd: Lcd;

export default async function initLcd(httpClient: AxiosInstance): Promise<void> {
    logger.info(`Initializing ${isClassic ? "classic" : "mainnet"} Lcd`)
    if (isClassic) {
        await initClassicLcd(httpClient)
        lcd = classicLcd
        return 
    }
    lcd = new MainnetLcd(httpClient)
}