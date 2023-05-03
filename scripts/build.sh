#! /usr/bin/bash
set -e

# Get script dir: https://stackoverflow.com/a/246128
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
ROOT=$(dirname -- "${SCRIPT_DIR}")

${ROOT}/scripts/build-core.sh

source ${ROOT}/venv/bin/activate
python ${ROOT}/tools/build.py
