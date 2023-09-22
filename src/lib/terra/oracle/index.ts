import * as logger from 'lib/logger'
import { isClassic } from ".."

import { MainnetOracle } from "./mainnet"
import { AxiosInstance } from 'axios';
import { Oracle } from './interfaces';
import initClassicOracle, { classicOracle } from './classic';

export let oracle: Oracle;

export default async function initOracle(httpClient: AxiosInstance): Promise<void> {
    logger.info(`Initializing ${isClassic ? "classic" : "mainnet"} Oracle`)
    if (isClassic) {
        await initClassicOracle(httpClient)
        oracle = classicOracle
        return
    }
    oracle = new MainnetOracle(httpClient)
}