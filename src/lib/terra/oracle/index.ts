import { ClassicOracle } from "./classic"
import { Oracle } from "./interfaces"
import { Terra2Oracle } from "./terra2"

const target: Oracle = process.env.TERRA_CHAIN_ID.includes("columbus") ? new ClassicOracle() : new Terra2Oracle()
export default target