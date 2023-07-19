import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Pool} from "./pool.model"

@Entity_()
export class Tick {
  constructor(props?: Partial<Tick>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: true})
  poolAddress!: string | undefined | null

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  tickIdx!: bigint

  @Column_("text", {nullable: false})
  poolId!: string

  @Index_()
  @ManyToOne_(() => Pool, {nullable: true})
  pool!: Pool

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidityGross!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidityNet!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  price0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  price1!: number

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

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesUSD!: number

  @Column_("timestamp with time zone", {nullable: false})
  createdAtTimestamp!: Date

  @Column_("int4", {nullable: false})
  createdAtBlockNumber!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidityProviderCount!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthOutside0X128!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthOutside1X128!: bigint
}
