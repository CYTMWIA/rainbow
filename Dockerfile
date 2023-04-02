FROM emscripten/emsdk:3.1.34

RUN wget https://mirrors.ustc.edu.cn/repogen/conf/ubuntu-https-4-jammy -O /etc/apt/sources.list

RUN apt update \
    && apt install -y \
        cmake \
        gcc-multilib \
    && apt clean

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

WORKDIR /ws
CMD bash
