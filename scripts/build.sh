#! /usr/bin/bash
set -e

# Get script dir: https://stackoverflow.com/a/246128
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
ROOT=$(dirname -- "${SCRIPT_DIR}")

pushd ${ROOT}/rainbow-frontend
npm run build
popd

mkdir -p dist
cp -rf ${ROOT}/rainbow-frontend/dist/* ./dist

source ${ROOT}/venv/bin/activate
python ${ROOT}/tools/bundle.py
