import { ClassicLcd } from "./classic"
import { Lcd } from "./interfaces"
import { Terra2Lcd } from "./terra2"

const target: Lcd = process.env.TERRA_CHAIN_ID.includes("columbus") ? new ClassicLcd() : new Terra2Lcd()
export default target