# Uniswap V3 squid

This is a reference squid migrated from the [Uniswap-V3 Subgraph](https://github.com/Uniswap/v3-subgraph) as a reference implementation. Fully indexes Uniswap v3 
trading data in about 3 hours on a Mac M1, saves it into a Postgres database and serves as GraphQL API. 
The squid fetches data from a test Ethereum Archive maintained by Subsquid Labs, which is currently in beta. 

## Run

### Prerequisites

- `Node.js 14+`, `npm`
- `Docker`
- A `wss` endpoint 

To run the squid, set `CHAIN_NODE` in `.env` to a `wss` endpoint to a Ethereum mainnet node. It can be obtained e.g. from Infura, or [Node Real](https://nodereal.io) 

1) Install dependencies:
```bash
npm ci
```
2) Build the squid:
```bash
npm run build
```
3) Start the database:
```bash
make up
```
4) Start the squid ETL (processor):
```bash
make process
```
5) Start the squid GraphQL API in a separate terminal window:
```bash
make serve
```

For mode details, inspect the [docs](https://docs.subsquid.io)

## Deploy

The squid can be [deployed to the Aquarium cloud](https://app.subsquid.io).
1) Create an Aquarium account and obtain a deployment key
2) [Add a secret](https://docs.subsquid.io/deploy-squid/env-variables/#secrets) called `CHAIN_NODE` 
3) [Deploy the squid](https://docs.subsquid.io/deploy-squid)

## Disclaimer

The Ethereum support of Subsquid is currently in beta. Subsquid Labs provides no guarantees of the stability of the test Archive endpoint used by the squid. 
Future releases of the Squid SDK and the EVM archives may introduce breaking changes. 
