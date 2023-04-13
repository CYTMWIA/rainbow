#include "markdown.h"

#include <cmark-gfm.h>
#include <cstring>

std::string render_markdown(const std::string &raw) {
  char *md = cmark_markdown_to_html(raw.c_str(), raw.size(), 0);
  std::string res{md};
  free(md);
  return res;
}

extern "C" char *render_markdown_c(const char* raw) {
  return cmark_markdown_to_html(raw, strlen(raw), 0);
}
