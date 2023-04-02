#! /usr/bin/bash

ROOT=$(pwd)
BUILD_DIR=${ROOT}/build

mkdir -p ${BUILD_DIR} && cd ${BUILD_DIR}
emcmake cmake .. && make
chmod 0777 -R ${BUILD_DIR}
