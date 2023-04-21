#! /usr/bin/bash
set -e

TAG=blog-frontend

rm -rf build dist

if which docker; then
    docker build --build-arg UID=$(id -u) --build-arg GID=$(id -g) -t ${TAG} .
    docker run --user $(id -u):$(id -g) -v $(pwd):/ws ${TAG} ./build-artifact.sh
else
    ./build-artifact.sh
fi

# mkdir -p dist/manifests
# cp manifests-test/* dist/manifests/

echo --- Artifact ---
ls --color=auto -hl dist/*
