import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_, ManyToOne as ManyToOne_, Index as Index_} from "typeorm"
import * as marshal from "./marshal"
import {Token} from "./token.model"

@Entity_()
export class TokenHourData {
  constructor(props?: Partial<TokenHourData>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("timestamp with time zone", {nullable: false})
  date!: Date

  @Column_("text", {nullable: false})
  tokenId!: string

  @Index_()
  @ManyToOne_(() => Token, {nullable: true})
  token!: Token

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volume!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  volumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  untrackedVolumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLocked!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  priceUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  feesUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  open!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  high!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  low!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  close!: number
}
