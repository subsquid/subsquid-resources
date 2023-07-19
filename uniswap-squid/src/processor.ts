import {EvmBatchProcessor} from '@subsquid/evm-processor'
import {TypeormDatabase} from '@subsquid/typeorm-store'
import {FACTORY_ADDRESS, POSITIONS_ADDRESS} from './utils/constants'
import {processFactory} from './mappings/factory'
import {processPairs} from './mappings/core'
import {processPositions} from './mappings/positionManager'
import * as factoryAbi from './abi/factory'
import * as poolAbi from './abi/pool'
import * as positionsAbi from './abi/NonfungiblePositionManager'
import {EntityManager} from './utils/entityManager'
import {
    Bundle,
    Burn,
    Factory,
    Mint,
    Pool,
    PoolDayData,
    PoolHourData,
    Position,
    Swap,
    Tick,
    TickDayData,
    Token,
    TokenDayData,
    TokenHourData,
    Transaction,
    UniswapDayData,
} from './model'

let processor = new EvmBatchProcessor()
    .setBlockRange({from: 12369621})
    .setDataSource({
        archive: 'https://eth.archive.subsquid.io',
        chain: process.env.ETH_CHAIN_NODE,
    })
    .addLog(FACTORY_ADDRESS, {
        filter: [[factoryAbi.events.PoolCreated.topic]],
        data: {
            evmLog: {
                topics: true,
                data: true,
            },
        } as const,
    })
    .addLog([], {
        filter: [
            [
                poolAbi.events.Burn.topic,
                poolAbi.events.Mint.topic,
                poolAbi.events.Initialize.topic,
                poolAbi.events.Swap.topic,
            ],
        ],
        data: {
            evmLog: {
                topics: true,
                data: true,
            },
            transaction: {
                hash: true,
                gasPrice: true,
                gas: true,
                from: true,
            },
        } as const,
    })
    .addLog(POSITIONS_ADDRESS, {
        filter: [
            [
                positionsAbi.events.IncreaseLiquidity.topic,
                positionsAbi.events.DecreaseLiquidity.topic,
                positionsAbi.events.Collect.topic,
                positionsAbi.events.Transfer.topic,
            ],
        ],
        data: {
            evmLog: {
                topics: true,
                data: true,
            },
        } as const,
    })

processor.run(new TypeormDatabase(), async (ctx) => {
    const entities = new EntityManager(ctx.store)
    const entitiesCtx = {...ctx, entities}

    await processFactory(entitiesCtx, ctx.blocks)
    await processPairs(entitiesCtx, ctx.blocks)
    await processPositions(entitiesCtx, ctx.blocks)

    await ctx.store.save(entities.values(Bundle))
    await ctx.store.save(entities.values(Factory))
    await ctx.store.save(entities.values(Token))
    await ctx.store.save(entities.values(Pool))
    await ctx.store.save(entities.values(Tick))
    await ctx.store.insert(entities.values(Transaction))
    await ctx.store.insert(entities.values(Mint))
    await ctx.store.insert(entities.values(Burn))
    await ctx.store.insert(entities.values(Swap))
    await ctx.store.save(entities.values(UniswapDayData))
    await ctx.store.save(entities.values(PoolDayData))
    await ctx.store.save(entities.values(PoolHourData))
    await ctx.store.save(entities.values(TokenDayData))
    await ctx.store.save(entities.values(TokenHourData))
    await ctx.store.save(entities.values(TickDayData))
    await ctx.store.save(entities.values(Position))
})
