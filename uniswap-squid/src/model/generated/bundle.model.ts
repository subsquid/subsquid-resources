import {Entity as Entity_, Column as Column_, PrimaryColumn as PrimaryColumn_} from "typeorm"
import * as marshal from "./marshal"

@Entity_()
export class Bundle {
  constructor(props?: Partial<Bundle>) {
    Object.assign(this, props)
  }

  @PrimaryColumn_()
  id!: string

  @Column_("numeric", {transformer: marshal.floatTransformer, nullable: false})
  ethPriceUSD!: number
}
