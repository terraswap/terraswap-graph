import * as logger from 'lib/logger'
import { AxiosInstance, AxiosResponse } from 'axios'
import { Lcd, NodeInfoResponse } from '../interfaces';
import { ClassicCosmos46Lcd } from './classic.cosmos46';
import { ClassicCosmos45Lcd } from './classic.cosmos45';
import { TERRA_CLASSIC } from 'lib/terra/consts';


export let classicLcd: Lcd;

export default async function initClassicLcd(httpClient: AxiosInstance): Promise<undefined> {
    logger.info(`Initializing Classic Lcd Version by ${httpClient.defaults.baseURL}`)
    const res: AxiosResponse<NodeInfoResponse> = await httpClient.get(`${httpClient.defaults.baseURL}/${TERRA_CLASSIC.nodeInfoPath}`);
    const version = res.data.application_version.cosmos_sdk_version;
    const targets: [RegExp, Lcd][] = [
        [ClassicCosmos46Lcd.version, new ClassicCosmos46Lcd(httpClient)],
        [ClassicCosmos45Lcd.version, new ClassicCosmos45Lcd(httpClient)],
    ];

    targets.forEach(([regex, lcd]) => {
        if (regex.test(version)) {
            classicLcd = lcd;
        }
    });
    if (!classicLcd) {
        throw new Error(`Unsupported Classic Lcd Version: ${version}`);
    }
}