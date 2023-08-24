import { isClassic } from ".."
import { ClassicOracle } from "./classic"
import { Oracle } from "./interfaces"
import { MainnetOracle } from "./mainnet"

const target: Oracle = isClassic ? new ClassicOracle() : new MainnetOracle()
export default target