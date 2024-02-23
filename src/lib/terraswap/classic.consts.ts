export const ClassicReceiverFeeAppliedTokenSet: Set<string> = new Set([
    "terra1zkhwtm4a559emekwj7z4vklzqupgjyad8ncpwvav38y5ef6g5tjse7ceus",
    "terra1naaldj58aerjvqzulrnfpeph60pjqlyp60gqryup8g4djy4cn4nqwm08c3"
])

export const ClassicReceiverFeeAppliedPairSet: Set<string> = new Set([
    "terra15ukfg2wy9xd4g8hd5nl2rdyn7arlwk4l9u6kalwmg0pew5pjlpgskydg2a",
    "terra1anwgp97zfn6zsz9t5vgtan4s09n24khx0twu3a550m4dsxj699pq8mg5yz",
    "terra17tq86waugtxrupjp3yz2fran6ghfcsdt35j257dk7tznljlkm9rq49j7ap"
])

interface OddTokenHandlingInfo {
    feeRate: string
    appliedHeight: number
    action: (a: string) => boolean
    pair: (p: string) => boolean
}

export const ClassicOddTokenAppliedPair: Set<string> = new Set([
    "terra1ggjadsdn285f4ae9wykle5lnawna7gdk32g6dfgpev8j0hx5jkpsc7u4gn", // uluna - BASE
])

const CLASSIC_BASE_TOKEN = "terra1uewxz67jhhhs2tj97pfm2egtk7zqxuhenm4y4m"
const APPLIED_HEIGHT = 16746830
export const ClassicOddTokenHandlerMap: Map<string, OddTokenHandlingInfo> = new Map([[CLASSIC_BASE_TOKEN, {
    feeRate: "0.048",
    appliedHeight: APPLIED_HEIGHT,
    action: (a: string) => a === "send",
    pair: (p: string) => ClassicOddTokenAppliedPair.has(p)
}]])
