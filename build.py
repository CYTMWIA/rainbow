#! /usr/bin/python3

################################################################################
# Settings
################################################################################

BLOG_TITLE = "Simple Blog"
TIME_OFFSET = 8 # +0800
# https://docs.python.org/zh-cn/3/library/time.html#time.strftime
TIME_FORMAT = "%y/%m/%d %H:%M:%S"
MATHJAX_SRC = "https://unpkg.com/mathjax@3.2.0/es5/tex-mml-chtml.js"

OUTPUT_DIR = "./output"
CONTENT_DIR = "./content"
TEMPLATES_DIR = "./templates"

################################################################################
# Sources
################################################################################

import datetime
import os
import shutil
import subprocess
from collections import namedtuple
from functools import partial

import jinja2
import markdown
import md4mathjax

Article = namedtuple("Article", ["title", "time", "html", "link"])
FileTime = namedtuple("FileTime", ["ctime", "mtime"])

open = partial(open, encoding="utf-8")

def ls(path):
    return [os.path.join(path, p)  for p in  os.listdir(path)]

def format_timestamp(utc_ts):
    tz = datetime.timezone(datetime.timedelta(hours=TIME_OFFSET))
    dt = datetime.datetime.fromtimestamp(utc_ts, tz)
    return dt.strftime(TIME_FORMAT)

def get_filetime_from_git(path: str):
    args = ["git", "log", "--pretty=%at", "--", path]
    proc = subprocess.run(args, stdout=subprocess.PIPE)
    if len(proc.stdout)==0:
        return FileTime(format_timestamp(0), format_timestamp(0))
    out = proc.stdout.decode()
    commits = filter(len, map(lambda s: s.strip(), out.split("\n")))
    commits = sorted(list(map(int, commits)))
    return FileTime(format_timestamp(commits[0]), format_timestamp(commits[-1]))

def build_markdown(path):
    title = os.path.basename(path)
    time = get_filetime_from_git(path)
    with open(path, "r") as f:
        raw = f.read()
    html = markdown.markdown(raw, extensions=[
        # https://python-markdown.github.io/extensions/
        "markdown.extensions.extra",
        "markdown.extensions.toc",
        "markdown_del_ins",
        md4mathjax.makeExtension(mathjax_src=MATHJAX_SRC)
    ])
    return Article(title, time, html, None)

def load_template(path):
    with open(os.path.join(TEMPLATES_DIR, path), "r") as f:
        return jinja2.Template(f.read())

def output_file(path, content):
    p = os.path.join(OUTPUT_DIR, path)
    with open(p ,"w") as f:
        f.write(content)

def main():
    article_paths = ls(CONTENT_DIR)
    about = None
    articles = []
    copyfiles = []
    for ap in article_paths:
        filename = os.path.basename(ap)
        if filename=="about.md":
            about = build_markdown(ap)
        elif filename.startswith("."):
            pass
        elif filename.endswith(".md"):
            articles.append(build_markdown(ap))
        else:
            copyfiles.append(ap)
    articles.sort(key=lambda a:a.time.ctime, reverse=True)
    articles = list(map(lambda a: a._replace(link=a.title+".html"), articles))

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


if __name__=="__main__":
    main()
