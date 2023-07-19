import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Pool} from "./pool.model"
import {Position} from "./position.model"
import {Transaction} from "./transaction.model"

@Entity_()
export class PositionSnapshot {
  constructor(props?: Partial<PositionSnapshot>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  owner!: string

  @Column_("text", {nullable: false})
  poolId!: string

  @Index_()
  @ManyToOne_(() => Pool, {nullable: true})
  pool!: Pool

  @Column_("text", {nullable: false})
  positionId!: string

  @Index_()
  @ManyToOne_(() => Position, {nullable: true})
  position!: Position

  @Column_("int4", {nullable: false})
  blockNumber!: number

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  liquidity!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  depositedToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  depositedToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  withdrawnToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  withdrawnToken1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesToken0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  collectedFeesToken1!: number

  @Column_("text", {nullable: false})
  transactionId!: string

  @Index_()
  @ManyToOne_(() => Transaction, {nullable: true})
  transaction!: Transaction

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthInside0LastX128!: bigint

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  feeGrowthInside1LastX128!: bigint
}
