import {BlockHandlerContext} from '@subsquid/evm-processor'
import * as ERC20 from '../abi/ERC20'
import * as ERC20NameBytes from '../abi/ERC20NameBytes'
import * as ERC20SymbolBytes from '../abi/ERC20SymbolBytes'
import {Multicall} from "../abi/multicall"
import {MULTICALL_ADDRESS} from './constants'
import {StaticTokenDefinition} from './staticTokenDefinition'
import {removeNullBytes} from './tools'

export async function fetchTokensSymbol(ctx: BlockHandlerContext<unknown>, tokenAddresses: string[]) {
    const multicall = new Multicall(ctx, MULTICALL_ADDRESS)

    const symbols = new Map<string, string>()

    const results = await multicall.tryAggregate(ERC20.functions.symbol, tokenAddresses.map(a => [a, []]))

    results.forEach((res, i) => {
        const address = tokenAddresses[i]
        let sym: string | undefined
        if (res.success) {
            sym = res.value
        } else if (res.returnData) {
            sym = ERC20SymbolBytes.functions.symbol.tryDecodeResult(res.returnData)
        }
        if (sym) {
            symbols.set(address, removeNullBytes(sym))
        } else {
            const value = StaticTokenDefinition.fromAddress(address)?.symbol
            if (value == null) ctx.log.warn(`Missing symbol for token ${address}`)
            symbols.set(address, value || 'unknown')
        }
    })

    return symbols
}

export async function fetchTokensName(ctx: BlockHandlerContext<unknown>, tokenAddresses: string[]) {
    const multicall = new Multicall(ctx, MULTICALL_ADDRESS)

    const names = new Map<string, string>()

    const results = await multicall.tryAggregate(ERC20.functions.name, tokenAddresses.map(a => [a, []]))

    results.forEach((res, i) => {
        const address = tokenAddresses[i]
        let name: string | undefined
        if (res.success) {
            name = res.value
        } else if (res.returnData) {
            name = ERC20NameBytes.functions.name.tryDecodeResult(res.returnData)
        }
        if (name) {
            names.set(address, removeNullBytes(name))
        } else {
            const value = StaticTokenDefinition.fromAddress(address)?.name
            if (value == null) ctx.log.warn(`Missing name for token ${address}`)
            names.set(address, value || 'unknown')
        }
    })

    return names
}

export async function fetchTokensTotalSupply(ctx: BlockHandlerContext<unknown>, tokenAddresses: string[]) {
    let multicall = new Multicall(ctx, MULTICALL_ADDRESS)

    let results = await multicall.tryAggregate(ERC20.functions.totalSupply, tokenAddresses.map(a => [a, []]))

    return new Map(
        results.map((res, i) => {
            let address = tokenAddresses[i]
            let supply = res.success ? res.value.toBigInt() : 0n
            return [address, supply]
        })
    )
}

export async function fetchTokensDecimals(ctx: BlockHandlerContext<unknown>, tokenAddresses: string[]) {
    let multicall = new Multicall(ctx, MULTICALL_ADDRESS)

    let results = await multicall.tryAggregate(ERC20.functions.decimals, tokenAddresses.map(a => [a, []]))

    return new Map(
        results.map((res, i) => {
            let address = tokenAddresses[i]
            let decimals = res.success ? res.value : 0
            return [address, decimals]
        })
    )
}
