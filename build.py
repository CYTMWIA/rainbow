#! /usr/bin/python3

import json
import os
import shutil
from collections import namedtuple
from functools import partial

import jinja2
import markdown
import md4mathjax

BLOG_TITLE = "Simple Blog"
TIME_OFFSET = 8  # +0800
# https://docs.python.org/zh-cn/3/library/time.html#time.strftime
TIME_FORMAT = "%y/%m/%d %H:%M:%S"
MATHJAX_SRC = "https://unpkg.com/mathjax@3.2.0/es5/tex-mml-chtml.js"

OUTPUT_DIR = "./output"
CONTENT_DIR = "./content"
TEMPLATES_DIR = "./templates"


Article = namedtuple("Article", [
    "title",
    "pub_time",
    "mod_time",
    "html",
    "path",
    "link"
])


open = partial(open, encoding="utf-8")


def ls(path):
    return [os.path.join(path, p) for p in os.listdir(path)]


def take_front_matter(raw_text: str):
    if raw_text.startswith("{"):
        split_point, stack, flag_string = None, 0, ""
        for i, c in enumerate(raw_text):
            if len(flag_string):
                if c == flag_string:
                    flag_string = ""
            else:
                if c == "{":
                    stack += 1
                elif c == "}":
                    stack -= 1
                elif c in "'\"":
                    flag_string = c
                if stack == 0:
                    split_point = i+1
                    break
        if split_point:
            front = json.loads(raw_text[:split_point])
            text = raw_text[split_point:].lstrip("\n")
            return front, text
    return {}, raw_text


def build_markdown(path):
    with open(path, "r") as f:
        raw = f.read()
    front, text = take_front_matter(raw)
    html = markdown.markdown(text, extensions=[
        # https://python-markdown.github.io/extensions/
        "markdown.extensions.extra",
        "markdown.extensions.toc",
        "markdown_del_ins",
        md4mathjax.makeExtension(mathjax_src=MATHJAX_SRC)
    ])
    return Article(
        front.get("title", os.path.basename(path)),
        front.get("pub_time", None),
        front.get("mod_time", None),
        html,
        path,
        None
    )


def load_template(path):
    with open(os.path.join(TEMPLATES_DIR, path), "r") as f:
        return jinja2.Template(f.read())


def output_file(path, content):
    p = os.path.join(OUTPUT_DIR, path)
    with open(p, "w") as f:
        f.write(content)


def main():
    article_paths = ls(CONTENT_DIR)
    about = None
    articles = []
    copyfiles = []
    for ap in article_paths:
        filename = os.path.basename(ap)
        if filename == "about.md":
            about = build_markdown(ap)
        elif filename.startswith("."):
            pass
        elif filename.endswith(".md"):
            articles.append(build_markdown(ap))
        else:
            copyfiles.append(ap)
    articles.sort(key=lambda a: a.pub_time, reverse=True)

    articles = list(map(
        lambda a: a._replace(link=os.path.basename(a.path)+".html"),
        articles
    ))

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_file("index.html", load_template("index.html").render(
        title=BLOG_TITLE,
        about=about,
        articles=articles,
    ))
    article_template = load_template("article.html")
    for art in articles:
        print(art._replace(html="..."))
        output_file(art.link, article_template.render(
            title=art.title,
            article=art
        ))
    for cp in copyfiles:
        print("COPY", cp)
        if os.path.isdir(cp):
            dst = os.path.join(OUTPUT_DIR, os.path.basename(cp))
            shutil.copytree(cp, dst, dirs_exist_ok=True)
        else:
            shutil.copy(cp, OUTPUT_DIR)


if __name__ == "__main__":
    main()
