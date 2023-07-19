import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, OneToMany as OneToMany_} from "typeorm"
import * as marshal from "./marshal"
import {TokenDayData} from "./tokenDayData.model"

@Entity_()
export class Token {
  constructor(props?: Partial<Token>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("text", {nullable: false})
  symbol!: string

  @Column_("text", {nullable: false})
  name!: string

  @Column_("int4", {nullable: false})
  decimals!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  totalSupply!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volume!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  untrackedVolumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  feesUSD!: number

  @Column_("int4", {nullable: false})
  txCount!: number

  @Column_("numeric", {transformer: marshal.bigintTransformer, nullable: false})
  poolCount!: bigint

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLocked!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedUSDUntracked!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  derivedETH!: number

  @Column_("text", {array: true, nullable: false})
  whitelistPools!: (string)[]

  @OneToMany_(() => TokenDayData, e => e.token)
  tokenDayData!: TokenDayData[]
}
