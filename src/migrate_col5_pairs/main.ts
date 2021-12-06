import { initORM } from 'orm'
import { migratePairsInfo } from './initial-pair-info.migrate'
import { migrateData } from './pairs-tokens.migrate'

async function run() {
  await initORM()
  await migrateData()
  await migratePairsInfo()
}

run().catch((err) => {
  console.error(err)
})
