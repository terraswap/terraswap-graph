import { Axios } from 'axios'
import * as logger from 'lib/logger'

export let rpc: Axios

export default function initRpc(URL: string = process.env.TERRA_RPC): Axios {
  logger.info(`Initialize RPC: ${URL}`)

  rpc = new Axios({
    timeout: 60 * 1000,
    baseURL: URL,
    headers: {
      'Content-Type': 'application/json',
    },
    responseType: 'json'
  })

  return rpc
}
