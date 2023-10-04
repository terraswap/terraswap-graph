import * as logger from 'lib/logger'
import { AxiosInstance, AxiosResponse } from 'axios'
import { Oracle } from '../interfaces';
import { TERRA_CLASSIC } from 'lib/terra/consts';
import { NodeInfoResponse } from 'lib/terra/lcd/interfaces';
import { ClassicCosmos46Oracle } from './classic.cosmos46';
import { ClassicCosmos45Oracle } from './classic.cosmos45';


export let classicOracle: Oracle;

export default async function initClassicOracle(httpClient: AxiosInstance): Promise<undefined> {
  logger.info(`Initializing Classic Oracle Version by ${httpClient.defaults.baseURL}`)
  const res: AxiosResponse<NodeInfoResponse> = await httpClient.get(`${httpClient.defaults.baseURL}/${TERRA_CLASSIC.nodeInfoPath}`);
  const version = res.data.application_version.cosmos_sdk_version;
  const targets: [RegExp, Oracle][] = [
    [ClassicCosmos46Oracle.version, new ClassicCosmos46Oracle(httpClient)],
    [ClassicCosmos45Oracle.version, new ClassicCosmos45Oracle(httpClient)],
  ];

  targets.forEach(([regex, oracle]) => {
    if (regex.test(version)) {
      classicOracle = oracle;
    }
  });
  if (!classicOracle) {
    throw new Error(`Unsupported Classic Lcd Version: ${version}`);
  }
}