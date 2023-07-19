/* eslint-disable prefer-const */
import {BigDecimal} from '@subsquid/big-decimal'

// return 0 if denominator is 0 in division
export function safeDiv(amount0: number, amount1: number): number {
    return amount1 === 0 ? 0 : amount0 / amount1
}

export function isNullEthValue(value: string): boolean {
    return value == '0x0000000000000000000000000000000000000000000000000000000000000001'
}

export function bigDecimalExp18(): BigDecimal {
    return BigDecimal('1000000000000000000')
}

export function convertEthToDecimal(eth: bigint): BigDecimal {
    return BigDecimal(eth, 18)
}

export function bigDecimalExponated(value: number, power: number): number {
    if (power === 0) {
        return 1
    }
    let negativePower = power < 0
    let result = 0 + value
    let powerAbs = negativePower ? -power : power
    for (let i = 1; i < powerAbs; i++) {
        result = result * value
    }

    if (negativePower) {
        result = safeDiv(1, result)
    }

    return result
}
