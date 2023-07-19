import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Mint} from "./mint.model"
import {Burn} from "./burn.model"
import {Swap} from "./swap.model"
import {Flash} from "./flash.model"
import {Collect} from "./collect.model"

@Entity_()
export class Transaction {
  constructor(props?: Partial<Transaction>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("int4", {nullable: false})
  blockNumber!: number

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  gasUsed!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  gasPrice!: bigint

  @OneToMany_(() => Mint, e => e.transaction)
  mints!: Mint[]

  @OneToMany_(() => Burn, e => e.transaction)
  burns!: Burn[]

  @OneToMany_(() => Swap, e => e.transaction)
  swaps!: Swap[]

  @OneToMany_(() => Flash, e => e.transaction)
  flashed!: Flash[]

  @OneToMany_(() => Collect, e => e.transaction)
  collects!: Collect[]
}
