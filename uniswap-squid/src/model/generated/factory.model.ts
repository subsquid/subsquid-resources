import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class Factory {
  constructor(props?: Partial<Factory>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("int4", {nullable: false})
  poolCount!: number

  @Column_("int4", {nullable: false})
  txCount!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalVolumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalVolumeETH!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalFeesUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalFeesETH!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  untrackedVolumeUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedUSD!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedETH!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedUSDUntracked!: number

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  totalValueLockedETHUntracked!: number

  @Column_("text", {nullable: false})
  owner!: string
}
