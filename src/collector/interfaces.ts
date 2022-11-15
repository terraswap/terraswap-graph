export type Pairs = Record<string, boolean>
export type Tokens = Record<string, boolean>

export interface CollectorRepo {
    getTokens(): Promise<Pairs>
    getPairs(): Promise<Tokens>
}

export interface Collector {
    collect(): Promise<void>
}

