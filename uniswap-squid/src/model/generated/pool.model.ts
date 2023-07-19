import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {Token} from "./token.model"
import {PoolHourData} from "./poolHourData.model"
import {PoolDayData} from "./poolDayData.model"
import {Mint} from "./mint.model"
import {Burn} from "./burn.model"
import {Swap} from "./swap.model"
import {Collect} from "./collect.model"
import {Tick} from "./tick.model"

@Entity_()
export class Pool {
  constructor(props?: Partial<Pool>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("timestamp with time zone", {nullable: false})
  createdAtTimestamp!: Date

  @Column_("int4", {nullable: false})
  createdAtBlockNumber!: number

  @Column_("text", {nullable: false})
  token0Id!: string

  @Index_()
  @ManyToOne_(() => Token, {nullable: true})
  token0!: Token

  @Column_("text", {nullable: false})
  token1Id!: string

  @Index_()
  @ManyToOne_(() => Token, {nullable: true})
  token1!: Token

  @Column_("int4", {nullable: false})
  feeTier!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidity!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  sqrtPrice!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthGlobal0X128!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthGlobal1X128!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  token0Price!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  token1Price!: number

  @Column_("int4", {nullable: true})
  tick!: number | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  observationIndex!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  untrackedVolumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  feesUSD!: number

  @Column_("int4", {nullable: false})
  txCount!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedETH!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedUSDUntracked!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidityProviderCount!: bigint

  @OneToMany_(() => PoolHourData, e => e.pool)
  poolHourData!: PoolHourData[]

  @OneToMany_(() => PoolDayData, e => e.pool)
  poolDayData!: PoolDayData[]

  @OneToMany_(() => Mint, e => e.pool)
  mints!: Mint[]

  @OneToMany_(() => Burn, e => e.pool)
  burns!: Burn[]

  @OneToMany_(() => Swap, e => e.pool)
  swaps!: Swap[]

  @OneToMany_(() => Collect, e => e.pool)
  collects!: Collect[]

  @OneToMany_(() => Tick, e => e.pool)
  ticks!: Tick[]
}
