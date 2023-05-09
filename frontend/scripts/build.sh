#! /usr/bin/bash
set -e

# Get script dir: https://stackoverflow.com/a/246128
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
ROOT=$(dirname -- "${SCRIPT_DIR}")
BUILD_DIR=${ROOT}/build
DOCKER_TAG="rainbow-builder"

cd "${ROOT}"

npm run build

cd "${ROOT}/dist"

wget https://cdn.bootcdn.net/ajax/libs/mathjax/3.2.2/es5/tex-svg-full.js -O mathjax.js
