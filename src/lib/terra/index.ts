export const isClassic = process.env.TERRA_CHAIN_ID.includes('columbus')
export * from './block'
export { default as oracle } from './oracle'
export { default as lcd } from './lcd'
