import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './ERC20NameBytes.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const functions = {
    name: new Func<[], {}, string>(
        abi, '0x06fdde03'
    ),
}

export class Contract extends ContractBase {

    name(): Promise<string> {
        return this.eth_call(functions.name, [])
    }
}
