export const ClassicReceiverFeeAppliedTokenSet: Set<string> = new Set([
    "terra1zkhwtm4a559emekwj7z4vklzqupgjyad8ncpwvav38y5ef6g5tjse7ceus",
    "terra1naaldj58aerjvqzulrnfpeph60pjqlyp60gqryup8g4djy4cn4nqwm08c3",
    "terra1m58hc296srr6xygrrfyu6u0e32pl8d459nfs55pmegke8zlv94rqsjz882"
])

export const ClassicReceiverFeeAppliedPairSet: Set<string> = new Set([
    "terra15ukfg2wy9xd4g8hd5nl2rdyn7arlwk4l9u6kalwmg0pew5pjlpgskydg2a",
    "terra1anwgp97zfn6zsz9t5vgtan4s09n24khx0twu3a550m4dsxj699pq8mg5yz",
    "terra17tq86waugtxrupjp3yz2fran6ghfcsdt35j257dk7tznljlkm9rq49j7ap",
    "terra1w4hthuvkm9lakfss5m6pvsn3dsn0kt4dsyen6c3y3s93fdzd436s87f390"
])

interface OddTokenHandlingInfo {
    feeRate: string
    appliedHeight: number
    action: (a: string) => boolean
    pair: (p: string) => boolean
}

export const ClassicOddTokenAppliedPair: Set<string> = new Set([
    "terra1ggjadsdn285f4ae9wykle5lnawna7gdk32g6dfgpev8j0hx5jkpsc7u4gn", // uluna - BASE
    "terra18f60c3xr8f4cq0u7m70gr6k8845rs4yagdtj80j8e9cyxmj7uj6shxl2e5", // uluna - CNip
])

const CLASSIC_BASE_TOKEN = "terra1uewxz67jhhhs2tj97pfm2egtk7zqxuhenm4y4m"
const APPLIED_HEIGHT = 16746830
export const ClassicOddTokenHandlerMap: Map<string, OddTokenHandlingInfo> = new Map([[CLASSIC_BASE_TOKEN, {
    feeRate: "0.048",
    appliedHeight: APPLIED_HEIGHT,
    action: (a: string) => a === "send",
    pair: (p: string) => ClassicOddTokenAppliedPair.has(p)
}]])
