import {assertNotNull, CommonHandlerContext} from '@subsquid/evm-processor'
import {Store} from '@subsquid/typeorm-store'
import {In} from 'typeorm'
import {splitIntoBatches} from './tools'

export interface EntityClass<T extends Entity> {
    new (): T
}

export interface Entity {
    id: string
}

export class EntityManager {
    private deferredIds = new Map<EntityClass<Entity>, Set<string>>()
    private cache = new Map<EntityClass<any>, Map<string, any>>()

    constructor(private store: Store) {}

    defer<T extends Entity>(entity: EntityClass<T>, ...ids: string[]) {
        let set = this.deferredIds.get(entity)
        if (set == null) {
            set = new Set()
            this.deferredIds.set(entity, set)
        }

        let cache = this.getCache(entity)
        for (const id of ids) {
            if (!cache.has(id)) set.add(id)
        }
        return this
    }

    async load<T extends Entity>(entity: EntityClass<T>) {
        const fetched = new Map<string, T>()

        const cache = this.getCache(entity)

        const ids = this.deferredIds.get(entity)
        if (!ids || ids.size == 0) return fetched

        for (const idBatch of splitIntoBatches([...ids], 1000))
            await this.store.findBy(entity, {id: In(idBatch)} as any).then((es) =>
                es.forEach((e) => {
                    cache.set(e.id, e)
                    fetched.set(e.id, e)
                })
            )
        ids.clear()

        return fetched
    }

    get<T extends Entity>(entity: EntityClass<T>, id: string): Promise<T | undefined>
    get<T extends Entity>(entity: EntityClass<T>, id: string, search: false): T | undefined
    get<T extends Entity>(entity: EntityClass<T>, id: string, search = true): Promise<T | undefined> | (T | undefined) {
        const cache = this.getCache(entity)
        let value = cache.get(id)
        if (search) {
            return value != null
                ? new Promise((resolve) => resolve(value))
                : this.store.get(entity, id).then((e) => {
                      if (e) cache.set(e.id, e)
                      return e
                  })
        } else {
            return value
        }
    }

    getOrFail<T extends Entity>(entity: EntityClass<T>, id: string): Promise<T>
    getOrFail<T extends Entity>(entity: EntityClass<T>, id: string, search: false): T
    getOrFail<T extends Entity>(entity: EntityClass<T>, id: string, search = true): Promise<T> | T {
        if (search) {
            return this.get(entity, id).then((e) => assertNotNull(e))
        } else {
            return assertNotNull(this.get(entity, id, search))
        }
    }

    add<T extends Entity>(entity: T) {
        this.getCache(entity.constructor as EntityClass<T>).set(entity.id, entity)
        return this
    }

    values<T extends Entity>(entity: EntityClass<T>) {
        return [...this.getCache(entity).values()]
    }

    private getCache<T extends Entity>(entity: EntityClass<T>) {
        let value = this.cache.get(entity)
        if (value == null) {
            value = new Map()
            this.cache.set(entity, value)
        }
        return value
    }
}
