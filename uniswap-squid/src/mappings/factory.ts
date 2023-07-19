import {assertNotNull, BatchBlock, BlockHandlerContext, CommonHandlerContext} from '@subsquid/evm-processor'
import {LogItem, TransactionItem} from '@subsquid/evm-processor/lib/interfaces/dataSelection'
import * as factoryAbi from '../abi/factory'
import {Bundle, Factory, Pool, Token} from '../model'
import {BlockMap} from '../utils/blockMap'
import {ADDRESS_ZERO, FACTORY_ADDRESS} from '../utils/constants'
import {EntityManager} from '../utils/entityManager'
import {WHITELIST_TOKENS} from '../utils/pricing'
import {fetchTokensDecimals, fetchTokensName, fetchTokensSymbol, fetchTokensTotalSupply} from '../utils/token'
import {last, processItem} from '../utils/tools'

interface PairCreatedData {
    poolId: string
    token0Id: string
    token1Id: string
    fee: number
}

type ContextWithEntityManager = CommonHandlerContext<unknown> & {entities: EntityManager}

// export class FactoryProcessor extends MappingProcessor<Item> {
export async function processFactory(ctx: ContextWithEntityManager, blocks: BatchBlock<Item>[]): Promise<void> {
    const newPairsData = await processItems(ctx, blocks)
    if (newPairsData.size == 0) return

    await prefetch(ctx, newPairsData)

    let bundle = await ctx.entities.get(Bundle, '1')
    if (!bundle) {
        bundle = createBundle('1')
        ctx.entities.add(bundle)
    }

    let factory = await ctx.entities.get(Factory, FACTORY_ADDRESS)
    if (!factory) {
        factory = createFactory(FACTORY_ADDRESS)
        ctx.entities.add(factory)
    }

    factory.poolCount++

    for (const [block, blockEventsData] of newPairsData) {
        for (const data of blockEventsData) {
            const pool = createPool(data.poolId, data.token0Id, data.token1Id)
            pool.feeTier = data.fee
            pool.createdAtTimestamp = new Date(block.timestamp)
            pool.createdAtBlockNumber = block.height

            ctx.entities.add(pool)

            let token0 = ctx.entities.get(Token, pool.token0Id, false)
            if (!token0) {
                token0 = createToken(pool.token0Id)
                ctx.entities.add(token0)
            }

            let token1 = ctx.entities.get(Token, pool.token1Id, false)
            if (!token1) {
                token1 = createToken(pool.token1Id)
                ctx.entities.add(token1)
            }

            // update whitelisted pools
            if (WHITELIST_TOKENS.includes(token0.id)) token1.whitelistPools.push(pool.id)
            if (WHITELIST_TOKENS.includes(token1.id)) token0.whitelistPools.push(pool.id)
        }
    }

    await syncTokens({...ctx, block: last(blocks).header}, ctx.entities.values(Token))

    // await ctx.store.save(bundle)
    // await ctx.store.save(factory)
    // await ctx.store.save(ctx.entities.values(Token))
    // await ctx.store.save(ctx.entities.values(Pool))
}

async function prefetch(ctx: ContextWithEntityManager, eventsData: BlockMap<PairCreatedData>) {
    for (const [, blockEventsData] of eventsData) {
        for (const data of blockEventsData) {
            ctx.entities.defer(Token, data.token0Id, data.token1Id)
        }
    }

    await ctx.entities.load(Token)
}

async function processItems(ctx: CommonHandlerContext<unknown>, blocks: BatchBlock<Item>[]) {
    let newPairsData = new BlockMap<PairCreatedData>()

    processItem(blocks, (block, item) => {
        if (
            item.address !== FACTORY_ADDRESS ||
            item.kind !== 'evmLog' ||
            item.evmLog.topics[0] !== factoryAbi.events.PoolCreated.topic
        )
            return

        const event = factoryAbi.events.PoolCreated.decode(item.evmLog)

        // // temp fix (i don't know what is this)
        // if (event.pool.toLowerCase() == '0x8fe8d9bb8eeba3ed688069c3d6b556c9ca258248') return

        newPairsData.push(block, {
            poolId: event.pool.toLowerCase(),
            token0Id: event.token0.toLowerCase(),
            token1Id: event.token1.toLowerCase(),
            fee: event.fee,
        })
    })

    return newPairsData
}

function createFactory(id: string) {
    const factory = new Factory({id})
    factory.poolCount = 0
    factory.totalVolumeETH = 0
    factory.totalVolumeUSD = 0
    factory.untrackedVolumeUSD = 0
    factory.totalFeesUSD = 0
    factory.totalFeesETH = 0
    factory.totalValueLockedETH = 0
    factory.totalValueLockedUSD = 0
    factory.totalValueLockedUSDUntracked = 0
    factory.totalValueLockedETHUntracked = 0
    factory.txCount = 0
    factory.owner = ADDRESS_ZERO

    return factory
}

function createToken(id: string) {
    let token = new Token({id})
    token.symbol = 'unknown'
    token.name = 'unknown'
    token.totalSupply = 0n
    token.decimals = 0
    token.derivedETH = 0
    token.volume = 0
    token.volumeUSD = 0
    token.feesUSD = 0
    token.untrackedVolumeUSD = 0
    token.totalValueLocked = 0
    token.totalValueLockedUSD = 0
    token.totalValueLockedUSDUntracked = 0
    token.txCount = 0
    token.poolCount = 0n
    token.whitelistPools = []

    return token
}

function createBundle(id: string) {
    const bundle = new Bundle({id})
    bundle.ethPriceUSD = 0

    return bundle
}

function createPool(id: string, token0Id: string, token1Id: string) {
    let pool = new Pool({id})

    pool.token0Id = token0Id
    pool.token1Id = token1Id
    pool.feeTier = 0
    pool.liquidityProviderCount = 0n
    pool.txCount = 0
    pool.liquidity = 0n
    pool.sqrtPrice = 0n
    pool.feeGrowthGlobal0X128 = 0n
    pool.feeGrowthGlobal1X128 = 0n
    pool.token0Price = 0
    pool.token1Price = 0
    pool.observationIndex = 0n
    pool.totalValueLockedToken0 = 0
    pool.totalValueLockedToken1 = 0
    pool.totalValueLockedUSD = 0
    pool.totalValueLockedETH = 0
    pool.totalValueLockedUSDUntracked = 0
    pool.volumeToken0 = 0
    pool.volumeToken1 = 0
    pool.volumeUSD = 0
    pool.feesUSD = 0
    pool.untrackedVolumeUSD = 0

    pool.collectedFeesToken0 = 0
    pool.collectedFeesToken1 = 0
    pool.collectedFeesUSD = 0

    return pool
}

async function syncTokens(ctx: BlockHandlerContext<unknown>, tokens: Token[]) {
    const ids = tokens.map((t) => t.id)

    const [symbols, names, totalSupplies, decimals] = await Promise.all([
        fetchTokensSymbol(ctx, ids),
        fetchTokensName(ctx, ids),
        fetchTokensTotalSupply(ctx, ids),
        fetchTokensDecimals(ctx, ids),
    ])

    for (const token of tokens) {
        token.symbol = assertNotNull(symbols.get(token.id))
        token.name = assertNotNull(names.get(token.id))
        token.totalSupply = assertNotNull(totalSupplies.get(token.id))
        token.decimals = assertNotNull(decimals.get(token.id))
    }
}

type Item =
    | LogItem<{
          evmLog: {
              topics: true
              data: true
          }
      }>
    | TransactionItem
