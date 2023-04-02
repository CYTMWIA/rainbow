#! /usr/bin/bash
set -e

TAG=blog-frontend

if which docker; then
    docker build -t ${TAG} .
    docker run -v $(pwd):/ws ${TAG} ./build-artifact.sh
else
    ./build-artifact.sh
fi

rm -rf dist
mkdir -p dist
cp -t dist build/**.js
chmod 0777 dist

echo --- Artifact ---
ls --color=auto -hl dist/*
