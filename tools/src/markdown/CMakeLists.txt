pybind11_add_module(
    markdown
    markdown.cpp
)

target_link_libraries(
    markdown PRIVATE
    libcmark-gfm.so
    libcmark-gfm-extensions.so
)

install(
    TARGETS markdown
    DESTINATION ${CMAKE_SOURCE_DIR}/..
)