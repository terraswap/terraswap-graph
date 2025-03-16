import { initORM, PairInfoEntity, TokenInfoEntity } from 'orm'
import { updatePairData, updateTokensPairs } from 'overwrite'
import initLcd from 'lib/terra/lcd'
import * as http from 'http'
import * as https from 'https'
import axios, { AxiosInstance } from 'axios'
import { PhoenixTerraswap } from 'lib/terraswap/terra2'
import { ColumbusTerraswap } from 'lib/terraswap/classic'
import initOracle from 'lib/terra/oracle'

async function run() {
  await initORM()
  console.log('ORM initialized')

  const httpClient: AxiosInstance = axios.create({
    baseURL: process.env.TERRA_LCD,
    httpAgent: new http.Agent({ keepAlive: true, maxTotalSockets: 5, keepAliveMsecs: 5 * 1000 }),
    httpsAgent: new https.Agent({ keepAlive: true, maxTotalSockets: 5 }),
    timeout: 10 * 1000,
  })
  console.log('Axios client initialized')
  await initLcd(httpClient)
  await initOracle(httpClient)
  console.log('LCD and Oracle initialized')
  
  let terraswap = null
  if (process.env.TERRA_CHAIN_ID === 'phoenix-1') {
    terraswap = new PhoenixTerraswap()
  } else {
    terraswap = new ColumbusTerraswap()
  }

  // Update tokens and pairs
  // const { pairsAdded, tokensAdded } = await updateTokensPairs(terraswap)
  // console.log(`Added ${pairsAdded} new pairs and ${tokensAdded} new tokens`)
  
  await updatePairData()
  // Additional steps could go here, like updating pair reserves and day/hour data

}

run().catch((err) => {
  console.error(err)
})
