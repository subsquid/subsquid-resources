import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Transaction} from "./transaction.model"
import {Pool} from "./pool.model"

@Entity_()
export class Flash {
  constructor(props?: Partial<Flash>) {
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

  @Column_("text", {nullable: false})
  poolId!: string

  @Index_()
  @ManyToOne_(() => Pool, {nullable: true})
  pool!: Pool

  @Column_("text", {nullable: false})
  sender!: string

  @Column_("text", {nullable: false})
  recipient!: string

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount0!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount1!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amountUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount0Paid!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  amount1Paid!: number

  @Column_("int4", {nullable: true})
  logIndex!: number | undefined | null
}
