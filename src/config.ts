const { SERVER_PORT } = process.env

export function validateConfig(): void {
  const keys = ['TERRA_LCD', 'TERRA_CHAIN_ID']
  const mantle = 'TERRA_MANTLE'
  const rpc = 'TERRA_RPC'
  for (const key of keys) {
    if (!process.env[key]) {
      throw new Error(`process.env.${key} is missing`)
    }
  }

  if (process.env.TERRA_CHAIN_ID.startsWith('col')) {
    if (!process.env[mantle]) {
      throw new Error(`process.env.${mantle} is missing`)
    }
  }

  if (process.env.TERRA_CHAIN_ID.startsWith('bombay')) {
    if (!process.env[rpc]) {
      throw new Error(`process.env.${rpc} is missing`)
    }
  }
}

const config = {
  PORT: SERVER_PORT ? +SERVER_PORT : 8765,
  START_BLOCK_HEIGHT: +(process.env.START_BLOCK_HEIGHT || 0),
}

export default config
