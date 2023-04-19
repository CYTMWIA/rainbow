add_executable(article article.cc)

target_include_directories(article PRIVATE
    /install/include
)

target_link_libraries(article PRIVATE
    markdown
    # openssl
    /install/lib/libcrypto.a
    /install/lib/libssl.a
)

target_link_options(article PRIVATE
    -sEXPORTED_RUNTIME_METHODS=ccall,cwrap
    -sEXPORTED_FUNCTIONS=_main,_render_markdown_c,_decrypt_string
    -sSINGLE_FILE
    --pre-js ${CMAKE_CURRENT_SOURCE_DIR}/article.js
)

install(
    FILES article.html
    DESTINATION ${CMAKE_SOURCE_DIR}/dist
)

install(
    TARGETS article
    DESTINATION ${CMAKE_SOURCE_DIR}/dist
)
