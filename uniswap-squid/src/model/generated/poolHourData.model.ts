import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Pool} from "./pool.model"

@Entity_()
export class PoolHourData {
  constructor(props?: Partial<PoolHourData>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("timestamp with time zone", {nullable: false})
  date!: Date

  @Column_("text", {nullable: false})
  poolId!: string

  @Index_()
  @ManyToOne_(() => Pool, {nullable: true})
  pool!: Pool

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidity!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  sqrtPrice!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  token0Price!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  token1Price!: number

  @Column_("int4", {nullable: true})
  tick!: number | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthGlobal0X128!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthGlobal1X128!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  tvlUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  feesUSD!: number

  @Column_("int4", {nullable: false})
  txCount!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  open!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  high!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  low!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  close!: number
}
