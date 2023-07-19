import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Transaction} from "./transaction.model"
import {Pool} from "./pool.model"
import {Token} from "./token.model"

@Entity_()
export class Swap {
  constructor(props?: Partial<Swap>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Index_()
  @ManyToOne_(() => Transaction, {nullable: true})
  transaction!: Transaction

  @Column_("text", {nullable: false})
  transactionId!: string

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Index_()
  @ManyToOne_(() => Pool, {nullable: true})
  pool!: Pool

  @Column_("text", {nullable: false})
  poolId!: string

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

  @Column_("text", {nullable: false})
  sender!: string

  @Column_("text", {nullable: false})
  recipient!: string

  @Column_("text", {nullable: false})
  origin!: string

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amountUSD!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  sqrtPriceX96!: bigint

  @Column_("int4", {nullable: false})
  tick!: number

  @Column_("int4", {nullable: true})
  logIndex!: number | undefined | null
}
