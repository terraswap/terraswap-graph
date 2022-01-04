import axios from 'axios'
import * as http from 'http';
import * as https from 'https';


const lcdUrl = process.env.TERRA_LCD || 'https://lcd.terra.dev'

const lcdClient = axios.create({
  baseURL: lcdUrl, 
  httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5*1000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
  timeout: 2 * 1000,
})

export async function getLatestBlockHeight(): Promise<number> {
  try {
    const res = await await lcdClient.get(`/blocks/latest`)
    return parseInt(res.data.block.header.height)
  } catch (err) {
    console.log(err)
    throw new Error(`cannot get latest block height`)
  }
}
