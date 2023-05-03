#! /usr/bin/bash
set -e

# Get script dir: https://stackoverflow.com/a/246128
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
ROOT=$(dirname -- "${SCRIPT_DIR}")

cd ${ROOT}

rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
