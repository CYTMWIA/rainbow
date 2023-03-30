#include <cmark-gfm.h>
#include <emscripten.h>

#include <cstdio>
#include <nlohmann/json.hpp>
#include <string>

std::string markdown_to_html(const std::string &raw) {
  char *md = cmark_markdown_to_html(raw.c_str(), raw.size(), 0);
  std::string res{md};
  free(md);
  return res;
}

extern "C" int frontend_entry(char *ptr_json_str) {
  using json = nlohmann::json;
  auto object = json::parse(ptr_json_str);

  if (object.contains("content")) {
    std::string content = object["content"];
    printf("%s", markdown_to_html(content).c_str());
  }

  return 0;
}

int main() {
  EM_ASM({ console.log("Hello, there! This is `main.cc`"); });
  return 0;
}
