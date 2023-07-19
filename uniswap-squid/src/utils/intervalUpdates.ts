import {UniswapDayData, PoolDayData, TokenDayData, TokenHourData, TickDayData} from '../model'

const HOUR_MS = 60 * 60 * 1000
const DAY_MS = 24 * HOUR_MS

export function snapshotId(id: string, timeIndex: number) {
    return `${id}-${timeIndex}`
}

export function getDayIndex(timestamp: number) {
    return Math.floor(timestamp / DAY_MS)
}

export function getHourIndex(timestamp: number) {
    return Math.floor(timestamp / HOUR_MS)
}

export function createUniswapDayData(factoryId: string, dayIndex: number) {
    const data = new UniswapDayData({id: snapshotId(factoryId, dayIndex)})
    data.date = new Date(dayIndex * DAY_MS)
    data.volumeETH = 0
    data.volumeUSD = 0
    data.volumeUSDUntracked = 0
    data.feesUSD = 0
    data.tvlUSD = 0
    data.txCount = 0

    return data
}

export function createPoolDayData(poolId: string, dayIndex: number) {
    const data = new PoolDayData({id: snapshotId(poolId, dayIndex)})
    data.date = new Date(dayIndex * DAY_MS)
    data.poolId = poolId
    data.volumeToken0 = 0
    data.volumeToken1 = 0
    data.volumeUSD = 0
    data.feesUSD = 0
    data.txCount = 0
    data.feeGrowthGlobal0X128 = 0n
    data.feeGrowthGlobal1X128 = 0n
    data.open = 0
    data.high = 0
    data.low = 0
    data.close = 0

    return data
}

export function createPoolHourData(poolId: string, hourIndex: number) {
    const data = new PoolDayData({id: snapshotId(poolId, hourIndex)})
    data.date = new Date(hourIndex * HOUR_MS)
    data.poolId = poolId
    data.volumeToken0 = 0
    data.volumeToken1 = 0
    data.volumeUSD = 0
    data.feesUSD = 0
    data.txCount = 0
    data.feeGrowthGlobal0X128 = 0n
    data.feeGrowthGlobal1X128 = 0n
    data.open = 0
    data.high = 0
    data.low = 0
    data.close = 0
    data.liquidity = 0n
    data.sqrtPrice = 0n
    data.token0Price = 0
    data.token1Price = 0
    data.tick = 0
    data.tvlUSD = 0

    return data
}

export function createTokenDayData(tokenId: string, dayIndex: number) {
    const data = new TokenDayData({id: snapshotId(tokenId, dayIndex)})
    data.date = new Date(dayIndex * DAY_MS)
    data.tokenId = tokenId
    data.volume = 0
    data.volumeUSD = 0
    data.feesUSD = 0
    data.untrackedVolumeUSD = 0
    data.open = 0
    data.high = 0
    data.low = 0
    data.close = 0
    data.priceUSD = 0
    data.totalValueLocked = 0
    data.totalValueLockedUSD = 0

    return data
}

export function createTokenHourData(tokenId: string, hourIndex: number) {
    const data = new TokenHourData({id: snapshotId(tokenId, hourIndex)})
    data.date = new Date(hourIndex * DAY_MS)
    data.tokenId = tokenId
    data.volume = 0
    data.volumeUSD = 0
    data.feesUSD = 0
    data.untrackedVolumeUSD = 0
    data.open = 0
    data.high = 0
    data.low = 0
    data.close = 0
    data.priceUSD = 0
    data.totalValueLocked = 0
    data.totalValueLockedUSD = 0

    return data
}

export function createTickDayData(tickId: string, dayIndex: number) {
    const data = new TickDayData({id: snapshotId(tickId, dayIndex)})
    data.date = new Date(dayIndex * DAY_MS)
    data.tickId = tickId
    data.liquidityGross = 0n
    data.liquidityNet = 0n
    data.volumeToken0 = 0
    data.volumeToken1 = 0
    data.volumeUSD = 0
    data.feesUSD = 0
    data.feeGrowthOutside0X128 = 0n
    data.feeGrowthOutside1X128 = 0n

    return data
}
