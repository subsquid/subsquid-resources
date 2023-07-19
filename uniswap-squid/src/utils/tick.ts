/* eslint-disable prefer-const */
import {} from '@subsquid/big-decimal'
import {BlockHandlerContext, LogHandlerContext} from '@subsquid/evm-processor'
import {Store} from '@subsquid/typeorm-store'
import {safeDiv} from '.'
import {Tick} from '../model'

export function createTick(tickId: string, tickIdx: number, poolId: string): Tick {
    let tick = new Tick({id: tickId})
    tick.tickIdx = BigInt(tickIdx)
    tick.poolId = poolId
    tick.poolAddress = poolId

    // tick.createdAtTimestamp = BigInt(ctx.block.timestamp)
    // tick.createdAtBlockNumber = BigInt(ctx.block.height)
    tick.liquidityGross = 0n
    tick.liquidityNet = 0n
    tick.liquidityProviderCount = 0n

    // 1.0001^tick is token1/token0.
    let price0 = Math.pow(1.0001, tickIdx)
    tick.price0 = price0
    tick.price1 = safeDiv(1, price0)

    tick.volumeToken0 = 0
    tick.volumeToken1 = 0
    tick.volumeUSD = 0
    tick.feesUSD = 0
    tick.untrackedVolumeUSD = 0
    tick.collectedFeesToken0 = 0
    tick.collectedFeesToken1 = 0
    tick.collectedFeesUSD = 0
    tick.liquidityProviderCount = 0n
    tick.feeGrowthOutside0X128 = 0n
    tick.feeGrowthOutside1X128 = 0n

    return tick
}

export function feeTierToTickSpacing(feeTier: number): number {
    if (feeTier === 10000) {
        return 200
    }
    if (feeTier === 3000) {
        return 60
    }
    if (feeTier === 500) {
        return 10
    }
    if (feeTier === 100) {
        return 1
    }

    throw Error('Unexpected fee tier')
}
