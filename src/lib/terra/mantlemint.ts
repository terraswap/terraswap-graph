import { Axios } from 'axios'
import * as logger from 'lib/logger'

export let mantleMint: Axios

export default function initMantleMint(URL: string = process.env.TERRA_MANTLE_MINT): Axios {
  logger.info('Initialize mantle mint')

  mantleMint = new Axios({
    timeout: 60 * 1000,
    baseURL: URL,
    headers: {
      'Content-Type': 'application/json',
    },
    responseType: 'json'
  })

  return mantleMint
}
