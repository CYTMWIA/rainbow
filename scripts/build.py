#! venv/bin/python

import datetime
import os
import shutil
import urllib.parse

import jinja2
import markdown
import md4mathjax
from common import load_config, ls, open, split_front_matter


class Article:
    title: str
    pub_time: str
    mod_time: str
    html: str
    path: str

    def __str__(self) -> str:
        d = vars(self).copy()
        d["html"] = "..."
        return f"{self.__class__.__name__}({str(d)})"


def make_article_loader(mathjax_src=None, time_format=None):
    def load(path: str):
        art = Article()

        art.path = path
        with open(path, "r") as f:
            raw = f.read()

        front, text = split_front_matter(raw)
        art.title = front.get("title", os.path.basename(path))
        art.pub_time = front.get("pub_time", None)
        art.mod_time = front.get("mod_time", None)
        strptime = datetime.datetime.strptime
        if art.pub_time != None:
            art.pub_time = strptime(art.pub_time, time_format).timestamp()
        if art.mod_time != None:
            art.mod_time = strptime(art.mod_time, time_format).timestamp()

        art.html = markdown.markdown(text, extensions=[
            # https://python-markdown.github.io/extensions/
            "markdown.extensions.extra",
            "markdown.extensions.toc",
            "markdown_del_ins",
            md4mathjax.makeExtension(mathjax_src=mathjax_src)
        ])

        return art
    return load


def make_template_loader(templates_dir: str, filters={}):
    loader = jinja2.FileSystemLoader(templates_dir)
    env = jinja2.Environment(loader=loader)
    env.filters.update(filters)
    return env.get_template


def make_output_functions(output_dir: str):
    def write(path: str, content: any):
        os.makedirs(output_dir, exist_ok=True)
        p = os.path.join(output_dir, path)
        with open(p, "w") as f:
            f.write(content)

    def copy(path: str):
        os.makedirs(output_dir, exist_ok=True)
        if os.path.isdir(path):
            dst = os.path.join(output_dir, os.path.basename(path))
            shutil.copytree(path, dst, dirs_exist_ok=True)
        else:
            shutil.copy(path, output_dir)

    return write, copy


def main():
    config = load_config()

    filters = {
        "datetime": config.formatter.datetime,
        "datetime_full":  config.formatter.datetime_full,
        "datetime_rfc2822": config.formatter.datetime_rfc2822
    }
    use_template = make_template_loader(config["templates_dir"], filters)
    write, copy = make_output_functions(config["output_dir"])
    load_article = make_article_loader(
        config["mathjax_src"],
        config["format_datetime_full"]
    )

    user_css = ""
    if config["css"]:
        with open(config["css"], "r") as f:
            user_css = f.read()

    about = None
    articles = []
    copyfiles = []
    for cp in ls(config["content_dir"]):
        filename = os.path.basename(cp)
        if filename == "about.md":
            about = load_article(cp)
        elif filename.startswith("."):
            pass
        elif filename.endswith(".md"):
            articles.append(load_article(cp))
        else:
            copyfiles.append(cp)

    articles.sort(key=lambda a: a.pub_time, reverse=True)
    for art in articles:
        # path is not *file system path* anymore, it's path in *url* now.
        art.path = os.path.basename(art.path)+".html"

    write("index.html", use_template("index.html").render(
        blog_name=config["blog_name"],
        about=about,
        articles=articles,
        user_css=f"/**/{user_css}/**/",
    ))

    write("rss.xml", use_template("rss.xml").render(
        blog_name=config["blog_name"],
        blog_url=config["blog_url"].rstrip("/"),
        articles=articles,
    ))

    article_template = use_template("article.html")
    for art in articles:
        print(art)
        write(art.path, article_template.render(
            blog_name=config["blog_name"],
            article=art,
            user_css=f"/**/{user_css}/**/",
        ))

    for cp in copyfiles:
        print("COPY", cp)
        copy(cp)


if __name__ == "__main__":
    main()
