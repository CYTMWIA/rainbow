#include <cmark-gfm.h>
#include <emscripten/emscripten.h>
#include <emscripten/html5.h>
#include <emscripten/val.h>

#include <cstdio>
#include <nlohmann/json.hpp>
#include <string>
#include <unordered_map>

using json = nlohmann::json;

std::string document_location(const std::string &member) {
  using val = emscripten::val;
  return val::global("document")["location"][member].as<std::string>();
}

std::unordered_map<std::string, std::string> parse_query(
    const std::string &query) {
  std::unordered_map<std::string, std::string> res;
  size_t begin = 0;
  std::string key;
  enum { NONE, KEY, VALUE } state = NONE;
  for (size_t i = 0; i < query.size(); i++) {
    if (state == NONE) {
      if (query[i] == '?')
        continue;
      else {
        begin = i;
        state = KEY;
      }
    } else if (state == KEY) {
      if (query[i] == '=') {
        key = query.substr(begin, i - begin);
        begin = i + 1;
        state = VALUE;
      }
    } else if (state == VALUE) {
      if (query[i] == '&' || i == query.size() - 1) {
        res[key] = query.substr(begin, i - begin);
        begin = i + 1;
        state = KEY;
      }
    }
  }
  return res;
}

std::string markdown_to_html(const std::string &raw) {
  char *md = cmark_markdown_to_html(raw.c_str(), raw.size(), 0);
  std::string res{md};
  free(md);
  return res;
}

json parse_json(char *ptr_json_str) {
  std::string json_str = std::string(ptr_json_str);

  auto query = parse_query(document_location("search"));
  if (query.count("password")) {
    emscripten_console_log(query["password"].c_str());
    // decrypt_json()
  }

  auto res = json::parse(json_str, nullptr, false);
  if (res.is_discarded()) {
    EM_ASM(alert("Invaild json (maybe wrong password)."));
    exit(-1);
  }
  return res;
}

void replace_document_body(const std::string &inner_html) {
  emscripten::val::global("document")["body"].set("innerHTML", inner_html);
}

void page_index(const json &page) {}

void page_article(const json &page) {
  if (page.contains("content")) {
    std::string content = page["content"];
    replace_document_body(markdown_to_html(content));
  }
}

extern "C" int frontend_entry(char *ptr_json_str) {
  auto page = parse_json(ptr_json_str);

  std::string type = "article";
  if (page.contains("type")) {
    type = page["type"];
  }

  if (type == "index") {
    page_index(page);
  } else if (type == "article") {
    page_article(page);
  } else {
    EM_ASM(alert("Unknown page type."));
    exit(-1);
  }

  return 0;
}

int main() {
  emscripten_console_log("Hello, there! This is `main.cc`");
  return 0;
}
