#! /usr/bin/bash

source ./third_party/emsdk/emsdk_env.sh

ROOT=$(pwd)
BUILD_DIR=${ROOT}/build
INSTALL_DIR=${ROOT}/install

mkdir -p $INSTALL_DIR

mkdir -p ${BUILD_DIR}/cmark-gfm && cd ${BUILD_DIR}/cmark-gfm
emcmake cmake \
    -DCMAKE_INSTALL_PREFIX=${INSTALL_DIR} \
    -DCMARK_TESTS=OFF \
    ${ROOT}/third_party/cmark-gfm \
    && make -j$(nproc) && make install

mkdir -p ${BUILD_DIR}/nlohmann_json && cd ${BUILD_DIR}/nlohmann_json
emcmake cmake \
    -DCMAKE_INSTALL_PREFIX=${INSTALL_DIR} \
    -DJSON_BuildTests=OFF \
    ${ROOT}/third_party/nlohmann_json \
    && make -j$(nproc) && make install

mkdir -p ${BUILD_DIR} && cd ${BUILD_DIR}
emcmake cmake .. && make
cd ..

rm -rf dist
mkdir -p dist
cp -t dist build/**.js build/**.wasm

echo ---
ls --color=auto -hl dist/*
