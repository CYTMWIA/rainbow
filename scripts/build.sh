#! /usr/bin/bash
set -e

# Get script dir: https://stackoverflow.com/a/246128
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
ROOT=$(dirname -- "${SCRIPT_DIR}")

rm -rf ./dist
mkdir -p ./dist

bun run ${ROOT}/build.ts
# cp -R -t ./dist ${ROOT}/stylesheets/*

if [ -d content/root ]; then
   cp -R -t ./dist content/root/*
fi

cd ./dist
du -sh *
