import { isClassic } from ".."
import { ClassicLcd } from "./classic"
import { Lcd } from "./interfaces"
import { MainnetLcd } from "./mainnet"

const target: Lcd = isClassic ? new ClassicLcd() : new MainnetLcd()
export default target