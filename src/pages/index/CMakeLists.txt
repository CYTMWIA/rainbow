add_executable(index main.cc)

target_link_libraries(index PRIVATE markdown)

target_link_options(index PRIVATE
    -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
    -sEXPORTED_FUNCTIONS=_render_markdown_c
    -sSINGLE_FILE
    --pre-js ${CMAKE_CURRENT_SOURCE_DIR}/main.js
)

install(
    FILES index.html
    DESTINATION ${CMAKE_SOURCE_DIR}/dist
)
install(
    TARGETS index
    DESTINATION ${CMAKE_SOURCE_DIR}/dist
)
