export const isClassic = process.env.TERRA_CHAIN_ID?.includes('columbus')
export const isColumbus4 = process.env.TERRA_CHAIN_ID?.includes('columbus-4')

export * from './block'
export { default as oracle } from './oracle'
export { default as lcd } from './lcd'
