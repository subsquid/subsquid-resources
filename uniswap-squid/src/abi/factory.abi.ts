export const ABI_JSON = [
    {
        "type": "event",
        "anonymous": false,
        "name": "FeeAmountEnabled",
        "inputs": [
            {
                "type": "uint24",
                "name": "fee",
                "indexed": true
            },
            {
                "type": "int24",
                "name": "tickSpacing",
                "indexed": true
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "OwnerChanged",
        "inputs": [
            {
                "type": "address",
                "name": "oldOwner",
                "indexed": true
            },
            {
                "type": "address",
                "name": "newOwner",
                "indexed": true
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "PoolCreated",
        "inputs": [
            {
                "type": "address",
                "name": "token0",
                "indexed": true
            },
            {
                "type": "address",
                "name": "token1",
                "indexed": true
            },
            {
                "type": "uint24",
                "name": "fee",
                "indexed": true
            },
            {
                "type": "int24",
                "name": "tickSpacing",
                "indexed": false
            },
            {
                "type": "address",
                "name": "pool",
                "indexed": false
            }
        ]
    },
    {
        "type": "function",
        "name": "createPool",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenA"
            },
            {
                "type": "address",
                "name": "tokenB"
            },
            {
                "type": "uint24",
                "name": "fee"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "pool"
            }
        ]
    },
    {
        "type": "function",
        "name": "enableFeeAmount",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint24",
                "name": "fee"
            },
            {
                "type": "int24",
                "name": "tickSpacing"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "feeAmountTickSpacing",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint24",
                "name": "fee"
            }
        ],
        "outputs": [
            {
                "type": "int24"
            }
        ]
    },
    {
        "type": "function",
        "name": "getPool",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "tokenA"
            },
            {
                "type": "address",
                "name": "tokenB"
            },
            {
                "type": "uint24",
                "name": "fee"
            }
        ],
        "outputs": [
            {
                "type": "address",
                "name": "pool"
            }
        ]
    },
    {
        "type": "function",
        "name": "owner",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address"
            }
        ]
    },
    {
        "type": "function",
        "name": "setOwner",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "_owner"
            }
        ],
        "outputs": []
    }
]
