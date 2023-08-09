import { ClassicLcd } from "./classic"
import { Lcd } from "./interfaces"
import { MainnetLcd } from "./mainnet"

const target: Lcd = process.env.TERRA_CHAIN_ID.includes("columbus") ? new ClassicLcd() : new MainnetLcd()
export default target