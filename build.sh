#! /usr/bin/bash
set -e

TAG=blog-frontend

rm -rf build dist

if which docker; then
    docker build -t ${TAG} .
    docker run -v $(pwd):/ws ${TAG} ./build-artifact.sh
else
    ./build-artifact.sh
fi

# cp test/* dist/

echo --- Artifact ---
ls --color=auto -hl dist/*
