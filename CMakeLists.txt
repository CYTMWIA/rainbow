cmake_minimum_required(VERSION 3.4)
project(FRONTEND)

set(CMAKE_EXPORT_COMPILE_COMMANDS true)

if("${CMAKE_BUILD_TYPE}" STREQUAL "")
    set(CMAKE_BUILD_TYPE "Release")
endif()

add_executable(frontend
    src/main.cc
)

target_include_directories(frontend PRIVATE
    ${CMAKE_SOURCE_DIR}/install/include
)
target_link_libraries(frontend PRIVATE
    # Emscripten
    embind
    # cmark-gfm
    ${CMAKE_SOURCE_DIR}/install/lib/libcmark-gfm.a
    ${CMAKE_SOURCE_DIR}/install/lib/libcmark-gfm-extensions.a
)

target_link_options(frontend PRIVATE
    -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
    -sEXPORTED_FUNCTIONS=_main,_frontend_entry
    -sSINGLE_FILE
    --pre-js ${CMAKE_SOURCE_DIR}/js/pre.js
    --post-js ${CMAKE_SOURCE_DIR}/js/post.js
    # --emrun
)
