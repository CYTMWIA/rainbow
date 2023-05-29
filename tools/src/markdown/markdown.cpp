#include <cmark-gfm-core-extensions.h>
#include <cmark-gfm.h>
#include <pybind11/pybind11.h>

#include <cstring>

static int PARSING_OPTS = CMARK_OPT_DEFAULT;
static int RENDERING_OPTS = CMARK_OPT_DEFAULT;

static const char *extensions[] = {"table", "strikethrough", "autolink",
                                   "tagfilter", "tasklist"};

static char *md2html(const char *md) {
  cmark_gfm_core_extensions_ensure_registered();

  cmark_parser *parser = cmark_parser_new(PARSING_OPTS);

  for (int i = 0; i < sizeof(extensions) / sizeof(extensions[0]); i++) {
    cmark_syntax_extension *ext = cmark_find_syntax_extension(extensions[i]);
    cmark_parser_attach_syntax_extension(parser, ext);
  }

  cmark_parser_feed(parser, md, strlen(md));

  cmark_node *document = cmark_parser_finish(parser);
  cmark_parser_free(parser);

  char *result = cmark_render_html(document, RENDERING_OPTS, NULL);
  cmark_node_free(document);

  return result;
}

std::string render2html(const std::string &raw) {
  char *md = md2html(raw.c_str());
  std::string res{md};
  free(md);
  return res;
}

PYBIND11_MODULE(markdown, m) {
  m.doc() = "Parseing & Rendering Markdown";
  m.def("render2html", &render2html,
        "A function that render markdown to html.");
}
