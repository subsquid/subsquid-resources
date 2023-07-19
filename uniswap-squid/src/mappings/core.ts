import {BigDecimal} from '@subsquid/big-decimal'
import {
    assertNotNull,
    BatchBlock,
    BlockHandlerContext,
    CommonHandlerContext,
    EvmBlock,
    LogHandlerContext,
} from '@subsquid/evm-processor'
import {LogItem, TransactionItem} from '@subsquid/evm-processor/lib/interfaces/dataSelection'
import {Store} from '@subsquid/typeorm-store'
import {Multicall} from "../abi/multicall"
import * as poolAbi from '../abi/pool'
import {
    Bundle,
    Burn,
    Factory,
    Mint,
    Pool,
    PoolDayData,
    PoolHourData,
    Swap,
    Tick,
    TickDayData,
    Token,
    TokenDayData,
    TokenHourData,
    Transaction,
    UniswapDayData,
} from '../model'
import {safeDiv} from '../utils'
import {BlockMap} from '../utils/blockMap'
import {FACTORY_ADDRESS, MULTICALL_ADDRESS} from '../utils/constants'
import {EntityManager} from '../utils/entityManager'
import {
    createPoolDayData,
    createPoolHourData,
    createTickDayData,
    createTokenDayData,
    createTokenHourData,
    createUniswapDayData,
    getDayIndex,
    getHourIndex,
    snapshotId,
} from '../utils/intervalUpdates'
import {
    getTrackedAmountUSD,
    MINIMUM_ETH_LOCKED,
    sqrtPriceX96ToTokenPrices,
    STABLE_COINS,
    USDC_WETH_03_POOL,
    WETH_ADDRESS,
} from '../utils/pricing'
import {createTick, feeTierToTickSpacing} from '../utils/tick'
import {last, processItem} from '../utils/tools'

type EventData =
    | (InitializeData & {type: 'Initialize'})
    | (MintData & {type: 'Mint'})
    | (BurnData & {type: 'Burn'})
    | (SwapData & {type: 'Swap'})

type ContextWithEntityManager = CommonHandlerContext<unknown> & {entities: EntityManager}

export async function processPairs(ctx: ContextWithEntityManager, blocks: BatchBlock<Item>[]): Promise<void> {
    let eventsData = processItems(ctx, blocks)
    if (eventsData.size == 0) return

    await prefetch(ctx, eventsData)

    let bundle = await ctx.entities.getOrFail(Bundle, '1')
    let factory = await ctx.entities.getOrFail(Factory, FACTORY_ADDRESS)

    for (let [block, blockEventsData] of eventsData) {
        for (let data of blockEventsData) {
            switch (data.type) {
                case 'Initialize':
                    await processInitializeData(ctx, block, data)
                    break
                case 'Mint':
                    await processMintData(ctx, block, data)
                    break
                case 'Burn':
                    await processBurnData(ctx, block, data)
                    break
                case 'Swap':
                    await processSwapData(ctx, block, data)
                    break
            }
        }
    }

    await Promise.all([
        updatePoolFeeVars({...ctx, block: last(blocks).header}, ctx.entities.values(Pool)),
        updateTickFeeVars({...ctx, block: last(blocks).header}, ctx.entities.values(Tick)),
    ])
}

async function prefetch(ctx: ContextWithEntityManager, eventsData: BlockMap<EventData>) {
    let dayIds = new Set<number>()
    let hoursIds = new Set<number>()

    for (let [block, blockEventsData] of eventsData) {
        for (let data of blockEventsData) {
            switch (data.type) {
                case 'Initialize':
                    ctx.entities.defer(Tick, tickId(data.poolId, data.tick))
                    ctx.entities.defer(Pool, data.poolId)
                    break
                case 'Mint':
                    ctx.entities.defer(Pool, data.poolId)
                    ctx.entities.defer(Tick, tickId(data.poolId, data.tickLower), tickId(data.poolId, data.tickUpper))
                    break
                case 'Burn':
                    ctx.entities.defer(Pool, data.poolId)
                    ctx.entities.defer(Tick, tickId(data.poolId, data.tickLower), tickId(data.poolId, data.tickUpper))
                    break
                case 'Swap':
                    ctx.entities.defer(Tick, tickId(data.poolId, data.tick))
                    ctx.entities.defer(Pool, data.poolId)
                    break
            }
        }
        dayIds.add(getDayIndex(block.timestamp))
        hoursIds.add(getHourIndex(block.timestamp))
    }

    let pools = await ctx.entities.load(Pool)

    let poolsTicksIds = collectTicksFromPools(pools.values())
    let ticks = await ctx.entities.defer(Tick, ...poolsTicksIds).load(Tick)

    let tokenIds = collectTokensFromPools(pools.values())
    let tokens = await ctx.entities.defer(Token, ...tokenIds).load(Token)

    let whiteListPoolsIds = collectWhiteListPoolsFromTokens(tokens.values())
    pools = await ctx.entities.defer(Pool, ...whiteListPoolsIds).load(Pool)

    let whiteListPoolsTokenIds = collectTokensFromPools(pools.values())
    tokens = await ctx.entities.defer(Token, ...whiteListPoolsTokenIds).load(Token)

    for (let index of dayIds) {
        ctx.entities.defer(UniswapDayData, snapshotId(FACTORY_ADDRESS, index))

        for (let id of pools.keys()) {
            ctx.entities.defer(PoolDayData, snapshotId(id, index))
        }

        for (let id of tokens.keys()) {
            ctx.entities.defer(TokenDayData, snapshotId(id, index))
        }

        for (let id of ticks.keys()) {
            ctx.entities.defer(TickDayData, snapshotId(id, index))
        }
    }

    for (let index of hoursIds) {
        for (let id of pools.keys()) {
            ctx.entities.defer(PoolHourData, snapshotId(id, index))
        }

        for (let id of tokens.keys()) {
            ctx.entities.defer(PoolHourData, snapshotId(id, index))
        }
    }

    await ctx.entities.load(Pool)
    await ctx.entities.load(Token)
    await ctx.entities.load(Tick)
    await ctx.entities.load(UniswapDayData)
    await ctx.entities.load(PoolDayData)
    await ctx.entities.load(TokenDayData)
    await ctx.entities.load(TickDayData)
    await ctx.entities.load(PoolHourData)
    await ctx.entities.load(TokenHourData)
}

function processItems(ctx: CommonHandlerContext<unknown>, blocks: BatchBlock<Item>[]) {
    let eventsData = new BlockMap<EventData>()

    processItem(blocks, (block, item) => {
        if (item.kind !== 'evmLog') return
        switch (item.evmLog.topics[0]) {
            case poolAbi.events.Initialize.topic: {
                let data = processInitialize({...ctx, block, ...item})
                eventsData.push(block, {
                    type: 'Initialize',
                    ...data,
                })
                return
            }
            case poolAbi.events.Mint.topic: {
                let data = processMint({...ctx, block, ...item})
                eventsData.push(block, {
                    type: 'Mint',
                    ...data,
                })
                return
            }
            case poolAbi.events.Burn.topic: {
                let data = processBurn({...ctx, block, ...item})
                eventsData.push(block, {
                    type: 'Burn',
                    ...data,
                })
                return
            }
            case poolAbi.events.Swap.topic: {
                let data = processSwap({...ctx, block, ...item})
                eventsData.push(block, {
                    type: 'Swap',
                    ...data,
                })
                return
            }
        }
    })

    return eventsData
}

async function processInitializeData(ctx: ContextWithEntityManager, block: EvmBlock, data: InitializeData) {
    let bundle = await ctx.entities.getOrFail(Bundle, '1')

    let pool = ctx.entities.get(Pool, data.poolId, false)
    if (pool == null) return

    let token0 = await ctx.entities.getOrFail(Token, pool.token0Id)
    let token1 = await ctx.entities.getOrFail(Token, pool.token1Id)

    // update pool sqrt price and tick
    pool.sqrtPrice = data.sqrtPrice
    pool.tick = data.tick

    // update token prices
    token0.derivedETH = await getEthPerToken(ctx, token0.id)
    token1.derivedETH = await getEthPerToken(ctx, token1.id)

    let usdcPool = await ctx.entities.get(Pool, USDC_WETH_03_POOL)
    bundle.ethPriceUSD = usdcPool?.token0Price || 0

    await updatePoolDayData(ctx, block, pool.id)
    await updatePoolHourData(ctx, block, pool.id)
    await updateTokenDayData(ctx, block, token0.id)
    await updateTokenHourData(ctx, block, token0.id)
    await updateTokenDayData(ctx, block, token1.id)
    await updateTokenHourData(ctx, block, token1.id)
}

async function processMintData(ctx: ContextWithEntityManager, block: EvmBlock, data: MintData) {
    let bundle = await ctx.entities.getOrFail(Bundle, '1')
    let factory = await ctx.entities.getOrFail(Factory, FACTORY_ADDRESS)

    let pool = ctx.entities.get(Pool, data.poolId, false)
    if (pool == null) return

    let token0 = await ctx.entities.getOrFail(Token, pool.token0Id)
    let token1 = await ctx.entities.getOrFail(Token, pool.token1Id)

    let amount0 = BigDecimal(data.amount0, token0.decimals).toNumber()
    let amount1 = BigDecimal(data.amount1, token1.decimals).toNumber()

    let amountUSD =
        amount0 * (token0.derivedETH * bundle.ethPriceUSD) + amount1 * (token1.derivedETH * bundle.ethPriceUSD)

    // reset tvl aggregates until new amounts calculated
    factory.totalValueLockedETH = factory.totalValueLockedETH - pool.totalValueLockedETH

    // update globals
    factory.txCount++

    // update token0 data
    token0.txCount++
    token0.totalValueLocked = token0.totalValueLocked + amount0
    token0.totalValueLockedUSD = token0.totalValueLocked * (token0.derivedETH * bundle.ethPriceUSD)

    // update token1 data
    token1.txCount++
    token1.totalValueLocked = token1.totalValueLocked + amount1
    token1.totalValueLockedUSD = token1.totalValueLocked * (token1.derivedETH * bundle.ethPriceUSD)

    // pool data
    pool.txCount++

    // Pools liquidity tracks the currently active liquidity given pools current tick.
    // We only want to update it on mint if the new position includes the current tick.
    if (pool.tick != null && data.tickLower <= pool.tick && data.tickUpper > pool.tick) {
        pool.liquidity += data.amount
    }

    pool.totalValueLockedToken0 = pool.totalValueLockedToken0 + amount0
    pool.totalValueLockedToken1 = pool.totalValueLockedToken1 + amount1
    pool.totalValueLockedETH =
        pool.totalValueLockedToken0 * token0.derivedETH + pool.totalValueLockedToken1 * token1.derivedETH
    pool.totalValueLockedUSD = pool.totalValueLockedETH * bundle.ethPriceUSD

    // reset aggregates with new amounts
    factory.totalValueLockedETH = factory.totalValueLockedETH + pool.totalValueLockedETH
    factory.totalValueLockedUSD = factory.totalValueLockedETH * bundle.ethPriceUSD

    let transaction = ctx.entities.get(Transaction, data.transaction.hash, false)
    if (!transaction) {
        transaction = createTransaction(block, data.transaction)
        ctx.entities.add(transaction)
    }

    ctx.entities.add(
        new Mint({
            id: `${pool.id}#${pool.txCount}`,
            transactionId: transaction.id,
            timestamp: transaction.timestamp,
            poolId: pool.id,
            token0Id: pool.token0Id,
            token1Id: pool.token1Id,
            owner: data.owner,
            sender: data.sender,
            origin: data.transaction.from,
            amount: data.amount,
            amount0,
            amount1,
            amountUSD,
            tickLower: data.tickLower,
            tickUpper: data.tickUpper,
            logIndex: data.logIndex,
        })
    )

    // tick ctx.entities
    let lowerTickId = tickId(pool.id, data.tickLower)
    let lowerTick = ctx.entities.get(Tick, lowerTickId, false)
    if (lowerTick == null) {
        lowerTick = createTick(lowerTickId, data.tickLower, pool.id)
        lowerTick.createdAtBlockNumber = block.height
        lowerTick.createdAtTimestamp = new Date(block.timestamp)
        ctx.entities.add(lowerTick)
    }

    let upperTickId = tickId(pool.id, data.tickUpper)
    let upperTick = ctx.entities.get(Tick, upperTickId, false)
    if (upperTick == null) {
        upperTick = createTick(upperTickId, data.tickUpper, pool.id)
        upperTick.createdAtBlockNumber = block.height
        upperTick.createdAtTimestamp = new Date(block.timestamp)
        ctx.entities.add(upperTick)
    }

    lowerTick.liquidityGross += data.amount
    lowerTick.liquidityNet += data.amount

    upperTick.liquidityGross += data.amount
    upperTick.liquidityNet -= data.amount

    // TODO: Update Tick's volume, fees, and liquidity provider count. Computing these on the tick
    // level requires reimplementing some of the swapping code from v3-core.

    await updateUniswapDayData(ctx, block)
    await updatePoolDayData(ctx, block, pool.id)
    await updatePoolHourData(ctx, block, pool.id)
    await updateTokenDayData(ctx, block, token0.id)
    await updateTokenHourData(ctx, block, token0.id)
    await updateTokenDayData(ctx, block, token1.id)
    await updateTokenHourData(ctx, block, token1.id)
    // await updateTickFeeVarsAndSave(lowerTick!, event)
    // await updateTickFeeVarsAndSave(upperTick!, event)
}

async function processBurnData(ctx: ContextWithEntityManager, block: EvmBlock, data: BurnData) {
    let bundle = await ctx.entities.getOrFail(Bundle, '1')
    let factory = await ctx.entities.getOrFail(Factory, FACTORY_ADDRESS)

    let pool = ctx.entities.get(Pool, data.poolId, false)
    if (pool == null) return

    let token0 = await ctx.entities.getOrFail(Token, pool.token0Id)
    let token1 = await ctx.entities.getOrFail(Token, pool.token1Id)

    let amount0 = BigDecimal(data.amount0, token0.decimals).toNumber()
    let amount1 = BigDecimal(data.amount1, token1.decimals).toNumber()

    let amountUSD =
        amount0 * (token0.derivedETH * bundle.ethPriceUSD) + amount1 * (token1.derivedETH * bundle.ethPriceUSD)

    // reset tvl aggregates until new amounts calculated
    factory.totalValueLockedETH = factory.totalValueLockedETH - pool.totalValueLockedETH

    // update globals
    factory.txCount++

    // update token0 data
    token0.txCount++
    token0.totalValueLocked = token0.totalValueLocked - amount0
    token0.totalValueLockedUSD = token0.totalValueLocked * (token0.derivedETH * bundle.ethPriceUSD)

    // update token1 data
    token1.txCount++
    token1.totalValueLocked = token1.totalValueLocked - amount1
    token1.totalValueLockedUSD = token1.totalValueLocked * (token1.derivedETH * bundle.ethPriceUSD)

    // pool data
    pool.txCount++
    // Pools liquidity tracks the currently active liquidity given pools current tick.
    // We only want to update it on burn if the position being burnt includes the current tick.
    if (pool.tick != null && data.tickLower <= pool.tick && data.tickUpper > pool.tick) {
        pool.liquidity -= data.amount
    }

    pool.totalValueLockedToken0 = pool.totalValueLockedToken0 - amount0
    pool.totalValueLockedToken1 = pool.totalValueLockedToken1 - amount1
    pool.totalValueLockedETH =
        pool.totalValueLockedToken0 * token0.derivedETH + pool.totalValueLockedToken1 * token1.derivedETH
    pool.totalValueLockedUSD = pool.totalValueLockedETH * bundle.ethPriceUSD

    // reset aggregates with new amounts
    factory.totalValueLockedETH = factory.totalValueLockedETH + pool.totalValueLockedETH
    factory.totalValueLockedUSD = factory.totalValueLockedETH * bundle.ethPriceUSD

    // burn entity
    let transaction = ctx.entities.get(Transaction, data.transaction.hash, false)
    if (!transaction) {
        transaction = createTransaction(block, data.transaction)
        ctx.entities.add(transaction)
    }

    ctx.entities.add(
        new Burn({
            id: `${pool.id}#${pool.txCount}`,
            transactionId: transaction.id,
            timestamp: new Date(block.timestamp),
            poolId: pool.id,
            token0Id: pool.token0Id,
            token1Id: pool.token1Id,
            owner: data.owner,
            origin: data.transaction.from,
            amount: data.amount,
            amount0,
            amount1,
            amountUSD,
            tickLower: data.tickLower,
            tickUpper: data.tickUpper,
            logIndex: data.logIndex,
        })
    )

    // tick ctx.entities
    let lowerTickId = tickId(pool.id, data.tickLower)
    let lowerTick = await ctx.entities.get(Tick, lowerTickId)

    let upperTickId = tickId(pool.id, data.tickUpper)
    let upperTick = await ctx.entities.get(Tick, upperTickId)

    if (lowerTick) {
        lowerTick.liquidityGross -= data.amount
        lowerTick.liquidityNet -= data.amount
    }

    if (upperTick) {
        upperTick.liquidityGross -= data.amount
        upperTick.liquidityNet += data.amount
    }

    await updateUniswapDayData(ctx, block)
    await updatePoolDayData(ctx, block, pool.id)
    await updatePoolHourData(ctx, block, pool.id)
    await updateTokenDayData(ctx, block, token0.id)
    await updateTokenHourData(ctx, block, token0.id)
    await updateTokenDayData(ctx, block, token1.id)
    await updateTokenHourData(ctx, block, token1.id)
    // updateTickFeeVarsAndSave(lowerTick!, event)
    // updateTickFeeVarsAndSave(upperTick!, event)
}

async function processSwapData(ctx: ContextWithEntityManager, block: EvmBlock, data: SwapData) {
    if (data.poolId == '0x9663f2ca0454accad3e094448ea6f77443880454') return

    let bundle = await ctx.entities.getOrFail(Bundle, '1')
    let factory = await ctx.entities.getOrFail(Factory, FACTORY_ADDRESS)

    let pool = ctx.entities.get(Pool, data.poolId, false)
    if (pool == null) return

    let token0 = await ctx.entities.getOrFail(Token, pool.token0Id)
    let token1 = await ctx.entities.getOrFail(Token, pool.token1Id)

    let amount0 = BigDecimal(data.amount0, token0.decimals).toNumber()
    let amount1 = BigDecimal(data.amount1, token1.decimals).toNumber()

    let oldTick = pool.tick || 0

    // need absolute amounts for volume
    let amount0Abs = Math.abs(amount0)
    let amount1Abs = Math.abs(amount1)

    let amount0ETH = amount0Abs * token0.derivedETH
    let amount1ETH = amount1Abs * token1.derivedETH
    let amount0USD = amount0ETH * bundle.ethPriceUSD
    let amount1USD = amount1ETH * bundle.ethPriceUSD

    // get amount that should be tracked only - div 2 because cant count both input and output as volume
    let amountTotalUSDTracked = getTrackedAmountUSD(token0.id, amount0USD, token1.id, amount1USD)
    let amountTotalETHTracked = safeDiv(amountTotalUSDTracked, bundle.ethPriceUSD)
    let amountTotalUSDUntracked = (amount0USD + amount1USD) / 2

    let feesETH = (amountTotalETHTracked * pool.feeTier) / 1000000
    let feesUSD = (amountTotalUSDTracked * pool.feeTier) / 1000000

    // global updates
    factory.txCount++
    factory.totalVolumeETH = factory.totalVolumeETH + amountTotalETHTracked
    factory.totalVolumeUSD = factory.totalVolumeUSD + amountTotalUSDTracked
    factory.untrackedVolumeUSD = factory.untrackedVolumeUSD + amountTotalUSDUntracked
    factory.totalFeesETH = factory.totalFeesETH + feesETH
    factory.totalFeesUSD = factory.totalFeesUSD + feesUSD

    // reset aggregate tvl before individual pool tvl updates
    let currentPoolTvlETH = pool.totalValueLockedETH
    factory.totalValueLockedETH = factory.totalValueLockedETH - currentPoolTvlETH

    // pool volume
    pool.txCount++
    pool.volumeToken0 = pool.volumeToken0 + amount0Abs
    pool.volumeToken1 = pool.volumeToken1 + amount1Abs
    pool.volumeUSD = pool.volumeUSD + amountTotalUSDTracked
    pool.untrackedVolumeUSD = pool.untrackedVolumeUSD + amountTotalUSDUntracked
    pool.feesUSD = pool.feesUSD + feesUSD

    // Update the pool with the new active liquidity, price, and tick.
    pool.liquidity = data.liquidity
    pool.tick = data.tick
    pool.sqrtPrice = data.sqrtPrice
    pool.totalValueLockedToken0 = pool.totalValueLockedToken0 + amount0
    pool.totalValueLockedToken1 = pool.totalValueLockedToken1 + amount1

    // update token0 data
    token0.txCount++
    token0.volume = token0.volume + amount0Abs
    token0.totalValueLocked = token0.totalValueLocked + amount0
    token0.volumeUSD = token0.volumeUSD + amountTotalUSDTracked
    token0.untrackedVolumeUSD = token0.untrackedVolumeUSD + amountTotalUSDUntracked
    token0.feesUSD = token0.feesUSD + feesUSD

    // update token1 data
    token1.txCount++
    token1.volume = token1.volume + amount1Abs
    token1.totalValueLocked = token1.totalValueLocked + amount1
    token1.volumeUSD = token1.volumeUSD + amountTotalUSDTracked
    token1.untrackedVolumeUSD = token1.untrackedVolumeUSD + amountTotalUSDUntracked
    token1.feesUSD = token1.feesUSD + feesUSD

    // updated pool ratess
    let prices = sqrtPriceX96ToTokenPrices(pool.sqrtPrice, token0.decimals, token1.decimals)
    pool.token0Price = prices[0]
    pool.token1Price = prices[1]

    // update USD pricing
    token0.derivedETH = await getEthPerToken(ctx, token0.id)
    token1.derivedETH = await getEthPerToken(ctx, token1.id)

    let usdcPool = await ctx.entities.get(Pool, USDC_WETH_03_POOL)
    bundle.ethPriceUSD = usdcPool?.token0Price || 0

    // Things afffected by new USD rates
    pool.totalValueLockedETH =
        pool.totalValueLockedToken0 * token0.derivedETH + pool.totalValueLockedToken1 * token1.derivedETH
    pool.totalValueLockedUSD = pool.totalValueLockedETH * bundle.ethPriceUSD

    factory.totalValueLockedETH = factory.totalValueLockedETH + pool.totalValueLockedETH
    factory.totalValueLockedUSD = factory.totalValueLockedETH * bundle.ethPriceUSD

    token0.totalValueLockedUSD = token0.totalValueLocked * token0.derivedETH * bundle.ethPriceUSD
    token1.totalValueLockedUSD = token1.totalValueLocked * token1.derivedETH * bundle.ethPriceUSD

    // create Swap event
    let transaction = ctx.entities.get(Transaction, data.transaction.hash, false)
    if (!transaction) {
        transaction = createTransaction(block, data.transaction)
        ctx.entities.add(transaction)
    }

    let swap = new Swap({id: pool.id + '#' + pool.txCount.toString()})
    swap.transactionId = transaction.id
    swap.timestamp = transaction.timestamp
    swap.poolId = pool.id
    swap.token0Id = pool.token0Id
    swap.token1Id = pool.token1Id
    swap.sender = data.sender
    swap.origin = data.transaction.from
    swap.recipient = data.recipient
    swap.amount0 = amount0
    swap.amount1 = amount1
    swap.amountUSD = amountTotalUSDTracked
    swap.tick = data.tick
    swap.sqrtPriceX96 = data.sqrtPrice
    swap.logIndex = data.logIndex
    ctx.entities.add(swap)

    // // interval data
    let uniswapDayData = await updateUniswapDayData(ctx, block)
    let poolDayData = await updatePoolDayData(ctx, block, pool.id)
    let poolHourData = await updatePoolHourData(ctx, block, pool.id)
    let token0DayData = await updateTokenDayData(ctx, block, token0.id)
    let token1DayData = await updateTokenHourData(ctx, block, token0.id)
    let token0HourData = await updateTokenDayData(ctx, block, token1.id)
    let token1HourData = await updateTokenHourData(ctx, block, token1.id)

    // // update volume metrics
    uniswapDayData.volumeETH = uniswapDayData.volumeETH + amountTotalETHTracked
    uniswapDayData.volumeUSD = uniswapDayData.volumeUSD + amountTotalUSDTracked
    uniswapDayData.feesUSD = uniswapDayData.feesUSD + feesUSD

    poolDayData.volumeUSD = poolDayData.volumeUSD + amountTotalUSDTracked
    poolDayData.volumeToken0 = poolDayData.volumeToken0 + amount0Abs
    poolDayData.volumeToken1 = poolDayData.volumeToken1 + amount1Abs
    poolDayData.feesUSD = poolDayData.feesUSD + feesUSD

    poolHourData.volumeUSD = poolHourData.volumeUSD + amountTotalUSDTracked
    poolHourData.volumeToken0 = poolHourData.volumeToken0 + amount0Abs
    poolHourData.volumeToken1 = poolHourData.volumeToken1 + amount1Abs
    poolHourData.feesUSD = poolHourData.feesUSD + feesUSD

    token0DayData.volume = token0DayData.volume + amount0Abs
    token0DayData.volumeUSD = token0DayData.volumeUSD + amountTotalUSDTracked
    token0DayData.untrackedVolumeUSD = token0DayData.untrackedVolumeUSD + amountTotalUSDTracked
    token0DayData.feesUSD = token0DayData.feesUSD + feesUSD

    token0HourData.volume = token0HourData.volume + amount0Abs
    token0HourData.volumeUSD = token0HourData.volumeUSD + amountTotalUSDTracked
    token0HourData.untrackedVolumeUSD = token0HourData.untrackedVolumeUSD + amountTotalUSDTracked
    token0HourData.feesUSD = token0HourData.feesUSD + feesUSD

    token1DayData.volume = token1DayData.volume + amount1Abs
    token1DayData.volumeUSD = token1DayData.volumeUSD + amountTotalUSDTracked
    token1DayData.untrackedVolumeUSD = token1DayData.untrackedVolumeUSD + amountTotalUSDTracked
    token1DayData.feesUSD = token1DayData.feesUSD + feesUSD

    token1HourData.volume = token1HourData.volume + amount1Abs
    token1HourData.volumeUSD = token1HourData.volumeUSD + amountTotalUSDTracked
    token1HourData.untrackedVolumeUSD = token1HourData.untrackedVolumeUSD + amountTotalUSDTracked
    token1HourData.feesUSD = token1HourData.feesUSD + feesUSD

    // Update inner vars of current or crossed ticks
    let newTick = pool.tick
    let tickSpacing = feeTierToTickSpacing(pool.feeTier)
    let modulo = Math.floor(newTick / tickSpacing)
    if (modulo == 0) {
        let tick = createTick(tickId(pool.id, newTick), newTick, pool.id)
        tick.createdAtBlockNumber = block.height
        tick.createdAtTimestamp = new Date(block.timestamp)
        ctx.entities.add(tick)
    }
}

async function getEthPerToken(ctx: ContextWithEntityManager, tokenId: string): Promise<number> {
    if (tokenId == WETH_ADDRESS) return 1

    // for now just take USD from pool with greatest TVL
    // need to update this to actually detect best rate based on liquidity distribution
    let largestLiquidityETH = MINIMUM_ETH_LOCKED
    let priceSoFar = 0

    let bundle = await ctx.entities.getOrFail(Bundle, '1')

    // hardcoded fix for incorrect rates
    // if whitelist includes token - get the safe price
    if (STABLE_COINS.includes(tokenId)) {
        priceSoFar = safeDiv(1, bundle.ethPriceUSD)
    } else {
        let token = await ctx.entities.getOrFail(Token, tokenId)
        for (let poolAddress of token.whitelistPools) {
            let pool = await ctx.entities.getOrFail(Pool, poolAddress)
            if (pool.liquidity === 0n) continue

            if (pool.token0Id == tokenId) {
                // whitelist token is token1
                let token1 = await ctx.entities.getOrFail(Token, pool.token1Id)
                // get the derived ETH in pool
                let ethLocked = pool.totalValueLockedToken1 * token1.derivedETH
                if (ethLocked > largestLiquidityETH) {
                    largestLiquidityETH = ethLocked
                    // token1 per our token * Eth per token1
                    priceSoFar = pool.token1Price * token1.derivedETH
                }
            }
            if (pool.token1Id == tokenId) {
                // whitelist token is token0
                let token0 = await ctx.entities.getOrFail(Token, pool.token0Id)
                // get the derived ETH in pool
                let ethLocked = pool.totalValueLockedToken0 * token0.derivedETH
                if (ethLocked > largestLiquidityETH) {
                    largestLiquidityETH = ethLocked
                    // token0 per our token * ETH per token0
                    priceSoFar = pool.token0Price * token0.derivedETH
                }
            }
        }
    }
    return priceSoFar // nothing was found return 0
}

async function updateUniswapDayData(ctx: ContextWithEntityManager, block: EvmBlock): Promise<UniswapDayData> {
    let uniswap = await ctx.entities.getOrFail(Factory, FACTORY_ADDRESS)

    let dayID = getDayIndex(block.timestamp)
    let id = snapshotId(FACTORY_ADDRESS, dayID)

    let uniswapDayData = ctx.entities.get(UniswapDayData, id, false)
    if (uniswapDayData == null) {
        uniswapDayData = createUniswapDayData(FACTORY_ADDRESS, dayID)
        ctx.entities.add(uniswapDayData)
    }
    uniswapDayData.tvlUSD = uniswap.totalValueLockedUSD
    uniswapDayData.txCount = uniswap.txCount

    return uniswapDayData
}

async function updatePoolDayData(ctx: ContextWithEntityManager, block: EvmBlock, poolId: string): Promise<PoolDayData> {
    let pool = await ctx.entities.getOrFail(Pool, poolId)

    let dayID = getDayIndex(block.timestamp)
    let dayPoolID = snapshotId(poolId, dayID)

    let poolDayData = ctx.entities.get(PoolDayData, dayPoolID, false)
    if (poolDayData == null) {
        poolDayData = createPoolDayData(poolId, dayID)
        ctx.entities.add(poolDayData)
    }

    if (pool.token0Price > poolDayData.high) {
        poolDayData.high = pool.token0Price
    }
    if (pool.token0Price < poolDayData.low) {
        poolDayData.low = pool.token0Price
    }

    poolDayData.liquidity = pool.liquidity
    poolDayData.sqrtPrice = pool.sqrtPrice
    poolDayData.feeGrowthGlobal0X128 = pool.feeGrowthGlobal0X128
    poolDayData.feeGrowthGlobal1X128 = pool.feeGrowthGlobal1X128
    poolDayData.token0Price = pool.token0Price
    poolDayData.token1Price = pool.token1Price
    poolDayData.tick = pool.tick
    poolDayData.tvlUSD = pool.totalValueLockedUSD
    poolDayData.txCount = pool.txCount

    return poolDayData
}

async function updatePoolHourData(
    ctx: ContextWithEntityManager,
    block: EvmBlock,
    poolId: string
): Promise<PoolHourData> {
    let pool = await ctx.entities.getOrFail(Pool, poolId)

    let hourID = getDayIndex(block.timestamp)
    let hourPoolID = snapshotId(poolId, hourID)

    let poolHourData = ctx.entities.get(PoolHourData, hourPoolID, false)
    if (poolHourData == null) {
        poolHourData = createPoolHourData(poolId, hourID)
        ctx.entities.add(poolHourData)
    }

    if (pool.token0Price > poolHourData.high) {
        poolHourData.high = pool.token0Price
    }
    if (pool.token0Price < poolHourData.low) {
        poolHourData.low = pool.token0Price
    }

    poolHourData.liquidity = pool.liquidity
    poolHourData.sqrtPrice = pool.sqrtPrice
    poolHourData.feeGrowthGlobal0X128 = pool.feeGrowthGlobal0X128
    poolHourData.feeGrowthGlobal1X128 = pool.feeGrowthGlobal1X128
    poolHourData.token0Price = pool.token0Price
    poolHourData.token1Price = pool.token1Price
    poolHourData.tick = pool.tick
    poolHourData.tvlUSD = pool.totalValueLockedUSD
    poolHourData.txCount = pool.txCount

    return poolHourData
}

async function updateTokenDayData(
    ctx: ContextWithEntityManager,
    block: EvmBlock,
    tokenId: string
): Promise<TokenDayData> {
    let bundle = await ctx.entities.getOrFail(Bundle, '1')

    let token = await ctx.entities.getOrFail(Token, tokenId)

    let dayID = getDayIndex(block.timestamp)
    let tokenDayID = snapshotId(tokenId, dayID)

    let tokenPrice = token.derivedETH * bundle.ethPriceUSD

    let tokenDayData = await ctx.entities.get(TokenDayData, tokenDayID, false)
    if (tokenDayData == null) {
        tokenDayData = createTokenDayData(tokenId, dayID)
        ctx.entities.add(tokenDayData)
    }

    if (tokenPrice > tokenDayData.high) {
        tokenDayData.high = tokenPrice
    }

    if (tokenPrice < tokenDayData.low) {
        tokenDayData.low = tokenPrice
    }

    tokenDayData.close = tokenPrice
    tokenDayData.priceUSD = token.derivedETH * bundle.ethPriceUSD
    tokenDayData.totalValueLocked = token.totalValueLocked
    tokenDayData.totalValueLockedUSD = token.totalValueLockedUSD

    return tokenDayData
}

async function updateTokenHourData(
    ctx: ContextWithEntityManager,
    block: EvmBlock,
    tokenId: string
): Promise<TokenHourData> {
    let bundle = await ctx.entities.getOrFail(Bundle, '1')

    let token = await ctx.entities.getOrFail(Token, tokenId)

    let hourID = getDayIndex(block.timestamp)
    let tokenHourID = snapshotId(tokenId, hourID)

    let tokenPrice = token.derivedETH * bundle.ethPriceUSD

    let tokenHourData = ctx.entities.get(TokenHourData, tokenHourID, false)
    if (tokenHourData == null) {
        tokenHourData = createTokenHourData(tokenId, hourID)
        ctx.entities.add(tokenHourData)
    }

    if (tokenPrice > tokenHourData.high) {
        tokenHourData.high = tokenPrice
    }

    if (tokenPrice < tokenHourData.low) {
        tokenHourData.low = tokenPrice
    }

    tokenHourData.close = tokenPrice
    tokenHourData.priceUSD = token.derivedETH * bundle.ethPriceUSD
    tokenHourData.totalValueLocked = token.totalValueLocked
    tokenHourData.totalValueLockedUSD = token.totalValueLockedUSD

    return tokenHourData as TokenHourData
}

async function updateTickDayData(ctx: ContextWithEntityManager, block: EvmBlock, tickId: string): Promise<TickDayData> {
    let tick = await ctx.entities.getOrFail(Tick, tickId)

    let dayID = getDayIndex(block.timestamp)
    let tickDayDataID = snapshotId(tickId, dayID)

    let tickDayData = await ctx.entities.get(TickDayData, tickDayDataID)
    if (tickDayData == null) {
        tickDayData = createTickDayData(tickId, dayID)
        ctx.entities.add(tickDayData)
    }

    tickDayData.liquidityGross = tick.liquidityGross
    tickDayData.liquidityNet = tick.liquidityNet
    tickDayData.volumeToken0 = tick.volumeToken0
    tickDayData.volumeToken1 = tick.volumeToken0
    tickDayData.volumeUSD = tick.volumeUSD
    tickDayData.feesUSD = tick.feesUSD
    tickDayData.feeGrowthOutside0X128 = tick.feeGrowthOutside0X128
    tickDayData.feeGrowthOutside1X128 = tick.feeGrowthOutside1X128

    return tickDayData
}

function createTransaction(
    block: {height: number; timestamp: number},
    transaction: {hash: string; gasPrice: bigint; gas: bigint}
) {
    return new Transaction({
        id: transaction.hash,
        blockNumber: block.height,
        timestamp: new Date(block.timestamp),
        gasUsed: transaction.gas,
        gasPrice: transaction.gasPrice,
    })
}

function collectTokensFromPools(pools: Iterable<Pool>) {
    let ids = new Set<string>()
    for (let pool of pools) {
        ids.add(pool.token0Id)
        ids.add(pool.token1Id)
    }
    return ids
}

function collectTicksFromPools(pools: Iterable<Pool>) {
    let ids = new Set<string>()
    for (let pool of pools) {
        ids.add(tickId(pool.id, pool.tick ?? 0))
    }
    return ids
}

function collectWhiteListPoolsFromTokens(tokens: Iterable<Token>) {
    let ids = new Set<string>()
    for (let token of tokens) {
        token.whitelistPools.forEach((id) => ids.add(id))
    }
    return ids
}

interface InitializeData {
    poolId: string
    tick: number
    sqrtPrice: bigint
}

function processInitialize(ctx: LogHandlerContext<unknown, {evmLog: {topics: true; data: true}}>): InitializeData {
    let event = poolAbi.events.Initialize.decode(ctx.evmLog)
    return {
        poolId: ctx.evmLog.address,
        tick: event.tick,
        sqrtPrice: event.sqrtPriceX96.toBigInt(),
    }
}

interface MintData {
    transaction: {hash: string; gasPrice: bigint; from: string; gas: bigint}
    poolId: string
    amount0: bigint
    amount1: bigint
    amount: bigint
    tickLower: number
    tickUpper: number
    sender: string
    owner: string
    logIndex: number
}

function processMint(
    ctx: LogHandlerContext<
        unknown,
        {evmLog: {topics: true; data: true}; transaction: {gasPrice: true; from: true; gas: true; hash: true}}
    >
): MintData {
    let event = poolAbi.events.Mint.decode(ctx.evmLog)
    return {
        transaction: {
            hash: ctx.transaction.hash,
            gasPrice: ctx.transaction.gasPrice,
            from: ctx.transaction.from,
            gas: ctx.transaction.gas,
        },
        poolId: ctx.evmLog.address,
        amount0: event.amount0.toBigInt(),
        amount1: event.amount1.toBigInt(),
        amount: event.amount.toBigInt(),
        tickLower: event.tickLower,
        tickUpper: event.tickUpper,
        sender: event.sender,
        owner: event.owner,
        logIndex: ctx.evmLog.index,
    }
}

interface BurnData {
    transaction: {hash: string; gasPrice: bigint; from: string; gas: bigint}
    poolId: string
    amount0: bigint
    amount1: bigint
    amount: bigint
    tickLower: number
    tickUpper: number
    owner: string
    logIndex: number
}

function processBurn(
    ctx: LogHandlerContext<
        unknown,
        {evmLog: {topics: true; data: true}; transaction: {gasPrice: true; from: true; gas: true; hash: true}}
    >
): BurnData {
    let event = poolAbi.events.Burn.decode(ctx.evmLog)
    return {
        transaction: {
            hash: ctx.transaction.hash,
            gasPrice: ctx.transaction.gasPrice,
            from: ctx.transaction.from,
            gas: ctx.transaction.gas,
        },
        poolId: ctx.evmLog.address,
        amount0: event.amount0.toBigInt(),
        amount1: event.amount1.toBigInt(),
        amount: event.amount.toBigInt(),
        tickLower: event.tickLower,
        tickUpper: event.tickUpper,
        owner: event.owner,
        logIndex: ctx.evmLog.index,
    }
}

interface SwapData {
    transaction: {hash: string; gasPrice: bigint; from: string; gas: bigint}
    poolId: string
    amount0: bigint
    amount1: bigint
    tick: number
    sqrtPrice: bigint
    sender: string
    recipient: string
    liquidity: bigint
    logIndex: number
}

function processSwap(
    ctx: LogHandlerContext<
        unknown,
        {evmLog: {topics: true; data: true}; transaction: {gasPrice: true; from: true; gas: true; hash: true}}
    >
): SwapData {
    let event = poolAbi.events.Swap.decode(ctx.evmLog)
    return {
        transaction: {
            hash: ctx.transaction.hash,
            gasPrice: ctx.transaction.gasPrice,
            from: ctx.transaction.from,
            gas: ctx.transaction.gas,
        },
        poolId: ctx.evmLog.address,
        amount0: event.amount0.toBigInt(),
        amount1: event.amount1.toBigInt(),
        tick: event.tick,
        sqrtPrice: event.sqrtPriceX96.toBigInt(),
        sender: event.sender,
        recipient: event.recipient,
        logIndex: ctx.evmLog.index,
        liquidity: event.liquidity.toBigInt(),
    }
}

export async function handleFlash(ctx: LogHandlerContext<Store>): Promise<void> {
    // update fee growth
    let pool = await ctx.store.get(Pool, ctx.evmLog.address).then(assertNotNull)
    let poolContract = new poolAbi.Contract(ctx, ctx.evmLog.address)
    let feeGrowthGlobal0X128 = await poolContract.feeGrowthGlobal0X128()
    let feeGrowthGlobal1X128 = await poolContract.feeGrowthGlobal1X128()
    pool.feeGrowthGlobal0X128 = feeGrowthGlobal0X128.toBigInt()
    pool.feeGrowthGlobal1X128 = feeGrowthGlobal1X128.toBigInt()
    await ctx.store.save(pool)
}

async function updateTickFeeVars(ctx: BlockHandlerContext<unknown>, ticks: Tick[]): Promise<void> {
    // not all ticks are initialized so obtaining null is expected behavior
    let multicall = new Multicall(ctx, MULTICALL_ADDRESS)

    const tickResult = await multicall.aggregate(
        poolAbi.functions.ticks,
        ticks.map<[address: string, args: [idx: number]]>(t => {
            return [t.poolId, [Number(t.tickIdx)]]
        }),
        500
    )

    for (let i = 0; i < ticks.length; i++) {
        ticks[i].feeGrowthOutside0X128 = tickResult[i][1].toBigInt()
        ticks[i].feeGrowthOutside1X128 = tickResult[i][3].toBigInt()
    }
}

async function updatePoolFeeVars(ctx: BlockHandlerContext<unknown>, pools: Pool[]): Promise<void> {
    let multicall = new Multicall(ctx, MULTICALL_ADDRESS)

    let fee0 = await multicall.aggregate(poolAbi.functions.feeGrowthGlobal0X128, pools.map(p => {
        return [p.id, []]
    }))

    let fee1 = await multicall.aggregate(poolAbi.functions.feeGrowthGlobal1X128, pools.map(p => {
        return [p.id, []]
    }))

    for (let i = 0; i < pools.length; i++) {
        pools[i].feeGrowthGlobal0X128 = fee0[i].toBigInt()
        pools[i].feeGrowthGlobal1X128 = fee1[i].toBigInt()
    }
}

function tickId(poolId: string, tickIdx: number) {
    return `${poolId}#${tickIdx}`
}

type Item =
    | LogItem<{
          evmLog: {
              topics: true
              data: true
          }
          transaction: {
              hash: true
              from: true
              gas: true
              gasPrice: true
          }
      }>
    | TransactionItem
