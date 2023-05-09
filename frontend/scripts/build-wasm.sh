#! /usr/bin/bash
set -e

# Get script dir: https://stackoverflow.com/a/246128
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
ROOT=$(dirname -- "${SCRIPT_DIR}")
BUILD_DIR=${ROOT}/build
DOCKER_TAG="rainbow-builder"

cd "${ROOT}"

rm -rf build dist

if which docker; then
    docker build --build-arg UID=$(id -u) --build-arg GID=$(id -g) -t ${DOCKER_TAG} .
    docker run --user $(id -u):$(id -g) -v $(pwd):/ws ${DOCKER_TAG} ./scripts/build-wasm.sh
else
    # Inside Docker
    mkdir -p "${BUILD_DIR}" && cd "${BUILD_DIR}"
    emcmake cmake .. && make && make install
    exit 0
fi

echo --- Artifact ---
ls --color=auto -hl ${ROOT}/dist
