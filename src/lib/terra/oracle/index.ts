import { ClassicOracle } from "./classic"
import { Oracle } from "./interfaces"
import { MainnetOracle } from "./mainnet"

const target: Oracle = process.env.TERRA_CHAIN_ID.includes("columbus") ? new ClassicOracle() : new MainnetOracle()
export default target