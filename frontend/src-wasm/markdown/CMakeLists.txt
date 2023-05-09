add_library(markdown src/markdown.cc)

target_include_directories(markdown PUBLIC include)

target_link_libraries(markdown PRIVATE
    /install/lib/libcmark-gfm.a
    /install/lib/libcmark-gfm-extensions.a
)
