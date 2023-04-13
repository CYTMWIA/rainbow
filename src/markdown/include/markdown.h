#pragma once

#include <string>
#include <emscripten.h>

std::string render_markdown(const std::string &raw);

// It's user's responsibility to free char pointer.
extern "C" char* render_markdown_c(const char* raw);
