#! /usr/bin/bash
set -e

ROOT=$(pwd)
BUILD_DIR=${ROOT}/build
DOCKER_TAG=blog-frontend

rm -rf build dist

if which docker; then
    docker build --build-arg UID=$(id -u) --build-arg GID=$(id -g) -t ${DOCKER_TAG} .
    docker run --user $(id -u):$(id -g) -v $(pwd):/ws ${DOCKER_TAG} ./scripts/build-core.sh
else
    # Inside Docker
    mkdir -p ${BUILD_DIR} && cd ${BUILD_DIR}
    emcmake cmake .. && make && make install
    exit 0
fi

echo --- Artifact ---
ls --color=auto -hl ${ROOT}/dist
