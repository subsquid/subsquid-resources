import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Transaction} from "./transaction.model"
import {Pool} from "./pool.model"

@Entity_()
export class Collect {
  constructor(props?: Partial<Collect>) {
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

  @Column_("text", {nullable: true})
  owner!: string | undefined | null

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
