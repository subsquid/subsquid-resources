import * as ethers from 'ethers'
import {LogEvent, Func, ContractBase} from './abi.support'
import {ABI_JSON} from './ERC20SymbolBytes.abi'

export const abi = new ethers.utils.Interface(ABI_JSON);

export const functions = {
    symbol: new Func<[], {}, string>(
        abi, '0x95d89b41'
    ),
}

export class Contract extends ContractBase {

    symbol(): Promise<string> {
        return this.eth_call(functions.symbol, [])
    }
}
