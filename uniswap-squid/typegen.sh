rm -rf ./src/abi

for abi in abis/*.json; do
    name=${abi%.*}
    name=${name#*/}
    npx squid-evm-typegen --abi "$abi" --output "./src/abi/$name.ts" || exit 1
done