#! venv/bin/python

import datetime
import json
import os
import shutil
import urllib.parse
from collections import namedtuple

import jinja2
import markdown
import md4mathjax
from common import load_config, ls, open, split_front_matter


class Article:
    title: str
    pub_time: str
    mod_time: str
    html: str
    path: str  # web path

    def __str__(self) -> str:
        d = vars(self).copy()
        d["html"] = "..."
        return f"{self.__class__.__name__}({str(d)})"


def make_article_loader(mathjax_src=None, time_format=None):
    def load(path: str):
        art = Article()

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
        path = path[1:] if path[0] in "\\/" else path
        dst = os.path.join(output_dir, path)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        with open(dst, "w") as f:
            f.write(content)

    def copy(src: str, dst: str):
        dst = dst[1:] if dst[0] in "\\/" else dst
        dst = os.path.join(output_dir, dst)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.isdir(src):
            shutil.copytree(src, dst, dirs_exist_ok=True)
        else:
            shutil.copy(src, dst)

    return write, copy


ContentItem = namedtuple("ContentItem", ["type", "path_fs", "path_web"])


def default_content_dir_settings():
    return {"path_web": "/"}


def content_item_type(path: str):
    filename = os.path.basename(path)
    if filename == "about.md":
        return "about.md", lambda path, filename: urllib.parse.urljoin(path, filename)[:-2]+"html"
    if filename.startswith("."):
        return "hidden", lambda path, filename: urllib.parse.urljoin(path, filename)
    if filename.endswith(".md"):
        return "markdown", lambda path, filename: urllib.parse.urljoin(path, filename)+".html"
    return "other", lambda path, filename: urllib.parse.urljoin(path, filename)


def walk_content_dir(content_dir: str, dir_settings: dict) -> list[ContentItem]:
    dir_settings = dir_settings.copy()
    filename_list = os.listdir(content_dir)
    if "_.json" in filename_list:
        with open(os.path.join(content_dir, "_.json")) as f:
            dir_settings.update(json.load(f))
        filename_list.remove("_.json")
    if dir_settings["path_web"][-1] != "/":
        dir_settings["path_web"] += "/"
    res: list[ContentItem] = []
    for name in filename_list:
        path_fs = os.path.join(content_dir, name)
        if os.path.isdir(path_fs):
            ds = dir_settings.copy()
            ds["path_web"] = urllib.parse.urljoin(ds["path_web"], name)
            print(path_fs, ds["path_web"])
            res += walk_content_dir(path_fs, ds)
        else:
            type_, make_web_path = content_item_type(path_fs)
            res.append(ContentItem(
                type_,
                path_fs,
                make_web_path(dir_settings["path_web"], name)))
    return res


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
    for item in walk_content_dir(config["content_dir"], default_content_dir_settings()):
        if item.type == "about.md":
            about = load_article(item.path_fs)
            continue
        elif item.type == "hidden":
            continue
        elif item.type == "markdown":
            art = load_article(item.path_fs)
            art.path = item.path_web
            articles.append(art)
            print("writing", item.path_web)
            write(item.path_web, use_template("article.html").render(
                blog_name=config["blog_name"],
                article=art,
                user_css=user_css,
            ))
        else:
            src = item.path_fs
            dst = os.path.join(config["output_dir"], item.path_web)
            print("copying", item.path_fs, dst)
            copy(src, dst)

    articles.sort(key=lambda a: a.pub_time, reverse=True)

    if about:
        print("building 'index.html'")
        write("index.html", use_template("index.html").render(
            blog_name=config["blog_name"],
            about=about,
            articles=articles,
            user_css=user_css,
        ))

    print("building 'rss.xml'")
    write("rss.xml", use_template("rss.xml").render(
        blog_name=config["blog_name"],
        blog_url=config["blog_url"].rstrip("/"),
        articles=articles,
    ))


if __name__ == "__main__":
    main()
