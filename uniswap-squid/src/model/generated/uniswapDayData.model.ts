import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class UniswapDayData {
  constructor(props?: Partial<UniswapDayData>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("timestamp with time zone", {nullable: false})
  date!: Date

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeETH!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeUSDUntracked!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  feesUSD!: number

  @Column_("int4", {nullable: false})
  txCount!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  tvlUSD!: number
}
