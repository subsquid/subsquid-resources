import {EvmBlock} from '@subsquid/evm-processor'
import {last} from './tools'

export class BlockMap<T> extends Map<EvmBlock, T[]> {
    push(block: EvmBlock, ...items: T[]) {
        let blockItems = this.get(block)
        if (!blockItems) {
            this.set(block, items)
        } else {
            blockItems.push(...items)
        }
        return this
    }

    some(block: EvmBlock, fn: (item: T) => boolean) {
        let blockItems = this.get(block)
        if (blockItems) {
            return blockItems.some(fn)
        }
        return false
    }

    map<R>(fn: (block: EvmBlock, items: T[]) => R[]) {
        return new BlockMap(this.entriesArray().map(([block, items]) => [block, fn(block, items)]))
    }

    keysArray() {
        return [...this.keys()]
    }

    entriesArray() {
        return [...this.entries()]
    }

    valuesArray() {
        return [...this.values()]
    }
}
