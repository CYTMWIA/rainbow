cmake_minimum_required(VERSION 3.4)
project(FRONTEND)

set(CMAKE_EXPORT_COMPILE_COMMANDS true)

if("${CMAKE_BUILD_TYPE}" STREQUAL "")
    set(CMAKE_BUILD_TYPE "Release")
endif()

include_directories(/install/include)

link_libraries(
    # Emscripten
    embind
    # cmark-gfm
    /install/lib/libcmark-gfm.a
    /install/lib/libcmark-gfm-extensions.a
    # openssl
    /install/lib/libcrypto.a
    /install/lib/libssl.a
)

add_subdirectory(src/markdown)
add_subdirectory(src/pages/index)
