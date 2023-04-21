FROM emscripten/emsdk:3.1.34

RUN wget https://mirrors.ustc.edu.cn/repogen/conf/ubuntu-https-4-jammy -O /etc/apt/sources.list

RUN apt update \
    && apt install -y \
        cmake \
        gcc-multilib \
        libeigen3-dev \
    && apt clean

# https://stackoverflow.com/questions/44683119/dockerfile-replicate-the-host-user-uid-and-gid-to-the-image
ARG UNAME=user
ARG UID=1000
ARG GID=1000
RUN groupadd -g $GID -o $UNAME \
    && useradd -m -u $UID -g $GID -o -s /bin/bash $UNAME \
    && mkdir /install /ws \
    && chown $UNAME /install /ws
USER $UNAME

WORKDIR /tmp
RUN wget https://github.com/github/cmark-gfm/archive/refs/tags/0.29.0.gfm.10.tar.gz -O cmark.tar.gz \
    && tar -x -z -f cmark.tar.gz && cd cmark-gfm-0.29.0.gfm.10 \
    && mkdir -p build && cd build \
    && emcmake cmake -DCMAKE_INSTALL_PREFIX=/install -DCMARK_TESTS=OFF .. \
    && make install -j$(nproc)

WORKDIR /tmp
RUN wget https://github.com/nlohmann/json/archive/refs/tags/v3.11.2.tar.gz -O json.tar.gz \
    && tar -x -z -f json.tar.gz && cd json-3.11.2 \
    && mkdir -p build && cd build \
    && emcmake cmake -DCMAKE_INSTALL_PREFIX=/install -DJSON_BuildTests=OFF .. \
    && make install -j$(nproc)

# https://github.com/openssl/openssl/issues/5443
# https://github.com/TrueBitFoundation/wasm-ports/blob/master/openssl.sh
WORKDIR /tmp
RUN wget https://github.com/openssl/openssl/archive/refs/tags/openssl-3.1.0.tar.gz -O openssl.tar.gz \
    && tar -x -z -f openssl.tar.gz && cd openssl-openssl-3.1.0 \
    && emconfigure ./Configure linux-generic64 --prefix=/install \
    && sed -i 's|^CROSS_COMPILE.*$|CROSS_COMPILE=|g' Makefile \
    && emmake make -j 12 build_generated libssl.a libcrypto.a \
    && cp -R include/openssl /install/include \
    && cp libcrypto.a libssl.a /install/lib

WORKDIR /ws
CMD bash
