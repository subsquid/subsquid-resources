import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Transaction} from "./transaction.model"
import {Pool} from "./pool.model"
import {Token} from "./token.model"

@Entity_()
export class Mint {
  constructor(props?: Partial<Mint>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  transactionId!: string

  @Index_()
  @ManyToOne_(() => Transaction, {nullable: true})
  transaction!: Transaction

  @Column_("timestamp with time zone", {nullable: false})
  timestamp!: Date

  @Column_("text", {nullable: false})
  poolId!: string

  @Index_()
  @ManyToOne_(() => Pool, {nullable: true})
  pool!: Pool

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
  owner!: string

  @Column_("text", {nullable: true})
  sender!: string | undefined | null

  @Column_("text", {nullable: false})
  origin!: string

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  amount!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: true})
  amountUSD!: number | undefined | null

  @Column_("int4", {nullable: false})
  tickLower!: number

  @Column_("int4", {nullable: false})
  tickUpper!: number

  @Column_("int4", {nullable: true})
  logIndex!: number | undefined | null
}
