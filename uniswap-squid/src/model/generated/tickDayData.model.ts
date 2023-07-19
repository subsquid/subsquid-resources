import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Tick} from "./tick.model"

@Entity_()
export class TickDayData {
  constructor(props?: Partial<TickDayData>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("timestamp with time zone", {nullable: false})
  date!: Date

  @Column_("text", {nullable: false})
  tickId!: string

  @Index_()
  @ManyToOne_(() => Tick, {nullable: true})
  tick!: Tick

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidityGross!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidityNet!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  feesUSD!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthOutside0X128!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthOutside1X128!: bigint
}
