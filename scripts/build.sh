#! /usr/bin/bash
set -e

ROOT=$(pwd)

${ROOT}/scripts/build-core.sh
${ROOT}/tools/build.py
