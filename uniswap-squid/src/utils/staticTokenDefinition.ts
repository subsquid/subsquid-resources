// Initialize a Token Definition with the attributes
export class StaticTokenDefinition {
    address: string
    symbol: string
    name: string
    decimals: number

    // Initialize a Token Definition with its attributes
    constructor(address: string, symbol: string, name: string, decimals: number) {
        this.address = address
        this.symbol = symbol
        this.name = name
        this.decimals = decimals
    }

    // Get all tokens with a static defintion
    static getStaticDefinitions(): Array<StaticTokenDefinition> {
        let staticDefinitions = new Array<StaticTokenDefinition>()

        // Add DGD
        let tokenDGD = new StaticTokenDefinition('0xe0b7927c4af23765cb51314a0e0521a9645f0e2a', 'DGD', 'DGD', 9)
        staticDefinitions.push(tokenDGD)

        // Add AAVE
        let tokenAAVE = new StaticTokenDefinition(
            '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
            'AAVE',
            'Aave Token',
            18
        )
        staticDefinitions.push(tokenAAVE)

        // Add LIF
        let tokenLIF = new StaticTokenDefinition('0xeb9951021698b42e4399f9cbb6267aa35f82d59d', 'LIF', 'Lif', 18)
        staticDefinitions.push(tokenLIF)

        // Add SVD
        let tokenSVD = new StaticTokenDefinition('0xbdeb4b83251fb146687fa19d1c660f99411eefe3', 'SVD', 'savedroid', 18)
        staticDefinitions.push(tokenSVD)

        // Add TheDAO
        let tokenTheDAO = new StaticTokenDefinition(
            '0xbb9bc244d798123fde783fcc1c72d3bb8c189413',
            'TheDAO',
            'TheDAO',
            16
        )
        staticDefinitions.push(tokenTheDAO)

        // Add HPB
        let tokenHPB = new StaticTokenDefinition('0x38c6a68304cdefb9bec48bbfaaba5c5b47818bb2', 'HPB', 'HPBCoin', 18)
        staticDefinitions.push(tokenHPB)

        return staticDefinitions
    }

    // Helper for hardcoded tokens
    static fromAddress(tokenAddress: string): StaticTokenDefinition | null {
        let staticDefinitions = this.getStaticDefinitions()

        // Search the definition using the address
        for (let i = 0; i < staticDefinitions.length; i++) {
            let staticDefinition = staticDefinitions[i]
            if (staticDefinition.address === tokenAddress) {
                return staticDefinition
            }
        }

        // If not found, return null
        return null
    }
}
