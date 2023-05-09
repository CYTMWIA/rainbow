add_executable(article article.cc)

target_include_directories(article PRIVATE
    /install/include
)

target_link_libraries(article PRIVATE
    markdown
)

target_link_options(article PRIVATE
    -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
    -sEXPORTED_FUNCTIONS=_main,_render_markdown_c

    -sSINGLE_FILE

    --pre-js ${CMAKE_CURRENT_SOURCE_DIR}/__article.js

    -sALLOW_MEMORY_GROWTH

    # -fsanitize=undefined
    # -fsanitize=address
)

install(
    FILES article.html
    DESTINATION ${CMAKE_SOURCE_DIR}/dist
)

install(
    TARGETS article
    DESTINATION ${CMAKE_SOURCE_DIR}/dist
)
