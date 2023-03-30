#! /usr/bin/bash

cd ./third_party/emsdk
./emsdk install latest
./emsdk activate latest
cd ../..

source ./third_party/emsdk/emsdk_env.sh

