export const ABI_JSON = [
    {
        "type": "constructor",
        "payable": false,
        "inputs": []
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Burn",
        "inputs": [
            {
                "type": "address",
                "name": "owner",
                "indexed": true
            },
            {
                "type": "int24",
                "name": "tickLower",
                "indexed": true
            },
            {
                "type": "int24",
                "name": "tickUpper",
                "indexed": true
            },
            {
                "type": "uint128",
                "name": "amount",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "amount0",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "amount1",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Collect",
        "inputs": [
            {
                "type": "address",
                "name": "owner",
                "indexed": true
            },
            {
                "type": "address",
                "name": "recipient",
                "indexed": false
            },
            {
                "type": "int24",
                "name": "tickLower",
                "indexed": true
            },
            {
                "type": "int24",
                "name": "tickUpper",
                "indexed": true
            },
            {
                "type": "uint128",
                "name": "amount0",
                "indexed": false
            },
            {
                "type": "uint128",
                "name": "amount1",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "CollectProtocol",
        "inputs": [
            {
                "type": "address",
                "name": "sender",
                "indexed": true
            },
            {
                "type": "address",
                "name": "recipient",
                "indexed": true
            },
            {
                "type": "uint128",
                "name": "amount0",
                "indexed": false
            },
            {
                "type": "uint128",
                "name": "amount1",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Flash",
        "inputs": [
            {
                "type": "address",
                "name": "sender",
                "indexed": true
            },
            {
                "type": "address",
                "name": "recipient",
                "indexed": true
            },
            {
                "type": "uint256",
                "name": "amount0",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "amount1",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "paid0",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "paid1",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "IncreaseObservationCardinalityNext",
        "inputs": [
            {
                "type": "uint16",
                "name": "observationCardinalityNextOld",
                "indexed": false
            },
            {
                "type": "uint16",
                "name": "observationCardinalityNextNew",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Initialize",
        "inputs": [
            {
                "type": "uint160",
                "name": "sqrtPriceX96",
                "indexed": false
            },
            {
                "type": "int24",
                "name": "tick",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Mint",
        "inputs": [
            {
                "type": "address",
                "name": "sender",
                "indexed": false
            },
            {
                "type": "address",
                "name": "owner",
                "indexed": true
            },
            {
                "type": "int24",
                "name": "tickLower",
                "indexed": true
            },
            {
                "type": "int24",
                "name": "tickUpper",
                "indexed": true
            },
            {
                "type": "uint128",
                "name": "amount",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "amount0",
                "indexed": false
            },
            {
                "type": "uint256",
                "name": "amount1",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "SetFeeProtocol",
        "inputs": [
            {
                "type": "uint8",
                "name": "feeProtocol0Old",
                "indexed": false
            },
            {
                "type": "uint8",
                "name": "feeProtocol1Old",
                "indexed": false
            },
            {
                "type": "uint8",
                "name": "feeProtocol0New",
                "indexed": false
            },
            {
                "type": "uint8",
                "name": "feeProtocol1New",
                "indexed": false
            }
        ]
    },
    {
        "type": "event",
        "anonymous": false,
        "name": "Swap",
        "inputs": [
            {
                "type": "address",
                "name": "sender",
                "indexed": true
            },
            {
                "type": "address",
                "name": "recipient",
                "indexed": true
            },
            {
                "type": "int256",
                "name": "amount0",
                "indexed": false
            },
            {
                "type": "int256",
                "name": "amount1",
                "indexed": false
            },
            {
                "type": "uint160",
                "name": "sqrtPriceX96",
                "indexed": false
            },
            {
                "type": "uint128",
                "name": "liquidity",
                "indexed": false
            },
            {
                "type": "int24",
                "name": "tick",
                "indexed": false
            }
        ]
    },
    {
        "type": "function",
        "name": "burn",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "int24",
                "name": "tickLower"
            },
            {
                "type": "int24",
                "name": "tickUpper"
            },
            {
                "type": "uint128",
                "name": "amount"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "amount0"
            },
            {
                "type": "uint256",
                "name": "amount1"
            }
        ]
    },
    {
        "type": "function",
        "name": "collect",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "int24",
                "name": "tickLower"
            },
            {
                "type": "int24",
                "name": "tickUpper"
            },
            {
                "type": "uint128",
                "name": "amount0Requested"
            },
            {
                "type": "uint128",
                "name": "amount1Requested"
            }
        ],
        "outputs": [
            {
                "type": "uint128",
                "name": "amount0"
            },
            {
                "type": "uint128",
                "name": "amount1"
            }
        ]
    },
    {
        "type": "function",
        "name": "collectProtocol",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "uint128",
                "name": "amount0Requested"
            },
            {
                "type": "uint128",
                "name": "amount1Requested"
            }
        ],
        "outputs": [
            {
                "type": "uint128",
                "name": "amount0"
            },
            {
                "type": "uint128",
                "name": "amount1"
            }
        ]
    },
    {
        "type": "function",
        "name": "factory",
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
        "name": "fee",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint24"
            }
        ]
    },
    {
        "type": "function",
        "name": "feeGrowthGlobal0X128",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "name": "feeGrowthGlobal1X128",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "name": "flash",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "uint256",
                "name": "amount0"
            },
            {
                "type": "uint256",
                "name": "amount1"
            },
            {
                "type": "bytes",
                "name": "data"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "increaseObservationCardinalityNext",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint16",
                "name": "observationCardinalityNext"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "initialize",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint160",
                "name": "sqrtPriceX96"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "liquidity",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint128"
            }
        ]
    },
    {
        "type": "function",
        "name": "maxLiquidityPerTick",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint128"
            }
        ]
    },
    {
        "type": "function",
        "name": "mint",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "int24",
                "name": "tickLower"
            },
            {
                "type": "int24",
                "name": "tickUpper"
            },
            {
                "type": "uint128",
                "name": "amount"
            },
            {
                "type": "bytes",
                "name": "data"
            }
        ],
        "outputs": [
            {
                "type": "uint256",
                "name": "amount0"
            },
            {
                "type": "uint256",
                "name": "amount1"
            }
        ]
    },
    {
        "type": "function",
        "name": "observations",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint256",
                "name": "index"
            }
        ],
        "outputs": [
            {
                "type": "uint32",
                "name": "blockTimestamp"
            },
            {
                "type": "int56",
                "name": "tickCumulative"
            },
            {
                "type": "uint160",
                "name": "secondsPerLiquidityCumulativeX128"
            },
            {
                "type": "bool",
                "name": "initialized"
            }
        ]
    },
    {
        "type": "function",
        "name": "observe",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "uint32[]",
                "name": "secondsAgos"
            }
        ],
        "outputs": [
            {
                "type": "int56[]",
                "name": "tickCumulatives"
            },
            {
                "type": "uint160[]",
                "name": "secondsPerLiquidityCumulativeX128s"
            }
        ]
    },
    {
        "type": "function",
        "name": "positions",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "bytes32",
                "name": "key"
            }
        ],
        "outputs": [
            {
                "type": "uint128",
                "name": "_liquidity"
            },
            {
                "type": "uint256",
                "name": "feeGrowthInside0LastX128"
            },
            {
                "type": "uint256",
                "name": "feeGrowthInside1LastX128"
            },
            {
                "type": "uint128",
                "name": "tokensOwed0"
            },
            {
                "type": "uint128",
                "name": "tokensOwed1"
            }
        ]
    },
    {
        "type": "function",
        "name": "protocolFees",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint128",
                "name": "token0"
            },
            {
                "type": "uint128",
                "name": "token1"
            }
        ]
    },
    {
        "type": "function",
        "name": "setFeeProtocol",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "uint8",
                "name": "feeProtocol0"
            },
            {
                "type": "uint8",
                "name": "feeProtocol1"
            }
        ],
        "outputs": []
    },
    {
        "type": "function",
        "name": "slot0",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "uint160",
                "name": "sqrtPriceX96"
            },
            {
                "type": "int24",
                "name": "tick"
            },
            {
                "type": "uint16",
                "name": "observationIndex"
            },
            {
                "type": "uint16",
                "name": "observationCardinality"
            },
            {
                "type": "uint16",
                "name": "observationCardinalityNext"
            },
            {
                "type": "uint8",
                "name": "feeProtocol"
            },
            {
                "type": "bool",
                "name": "unlocked"
            }
        ]
    },
    {
        "type": "function",
        "name": "snapshotCumulativesInside",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "int24",
                "name": "tickLower"
            },
            {
                "type": "int24",
                "name": "tickUpper"
            }
        ],
        "outputs": [
            {
                "type": "int56",
                "name": "tickCumulativeInside"
            },
            {
                "type": "uint160",
                "name": "secondsPerLiquidityInsideX128"
            },
            {
                "type": "uint32",
                "name": "secondsInside"
            }
        ]
    },
    {
        "type": "function",
        "name": "swap",
        "constant": false,
        "payable": false,
        "inputs": [
            {
                "type": "address",
                "name": "recipient"
            },
            {
                "type": "bool",
                "name": "zeroForOne"
            },
            {
                "type": "int256",
                "name": "amountSpecified"
            },
            {
                "type": "uint160",
                "name": "sqrtPriceLimitX96"
            },
            {
                "type": "bytes",
                "name": "data"
            }
        ],
        "outputs": [
            {
                "type": "int256",
                "name": "amount0"
            },
            {
                "type": "int256",
                "name": "amount1"
            }
        ]
    },
    {
        "type": "function",
        "name": "tickBitmap",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "int16",
                "name": "wordPosition"
            }
        ],
        "outputs": [
            {
                "type": "uint256"
            }
        ]
    },
    {
        "type": "function",
        "name": "tickSpacing",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "int24"
            }
        ]
    },
    {
        "type": "function",
        "name": "ticks",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [
            {
                "type": "int24",
                "name": "tick"
            }
        ],
        "outputs": [
            {
                "type": "uint128",
                "name": "liquidityGross"
            },
            {
                "type": "int128",
                "name": "liquidityNet"
            },
            {
                "type": "uint256",
                "name": "feeGrowthOutside0X128"
            },
            {
                "type": "uint256",
                "name": "feeGrowthOutside1X128"
            },
            {
                "type": "int56",
                "name": "tickCumulativeOutside"
            },
            {
                "type": "uint160",
                "name": "secondsPerLiquidityOutsideX128"
            },
            {
                "type": "uint32",
                "name": "secondsOutside"
            },
            {
                "type": "bool",
                "name": "initialized"
            }
        ]
    },
    {
        "type": "function",
        "name": "token0",
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
        "name": "token1",
        "constant": true,
        "stateMutability": "view",
        "payable": false,
        "inputs": [],
        "outputs": [
            {
                "type": "address"
            }
        ]
    }
]
