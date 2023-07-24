#! venv/bin/python

import base64
import datetime
import hashlib
import json
import math
import os
import re
import shutil
import sys
import time

import common
import requests
from common import load_config, ls, ls_abs, split_front_matter
from cryptography.hazmat.primitives.ciphers.aead import AESGCM


def hash_string(s: str):
    return hashlib.sha1(s.encode()).digest().hex()


def encrypt_string(s: str, password: str):
    key_len = 256  # bits
    password = password.encode("utf-8")
    key = (password*(int(key_len/len(password))+1))[:key_len//8]
    aesgcm = AESGCM(key)

    iv = os.urandom(12)
    data = aesgcm.encrypt(iv, s.encode("utf-8"), None)

    return data, iv


def read(src: str):
    src = os.path.abspath(src)

    with open(src, "r", encoding="utf-8") as f:
        return f.read()


def write(dst: str, content: any):
    dst = os.path.abspath(dst)

    os.makedirs(os.path.dirname(dst), exist_ok=True)
    w = "wb" if isinstance(content, bytes) else "w"
    encoding = "utf-8" if w == "w" else None
    with open(dst, w, encoding=encoding) as f:
        f.write(content)


def copy_dir(src_dir: str, dst_dir: str):
    src_dir = os.path.abspath(src_dir)
    dst_dir = os.path.abspath(dst_dir)
    os.makedirs(dst_dir, exist_ok=True)
    return shutil.copytree(src_dir, dst_dir, dirs_exist_ok=True)


def copy_file(src_file: str, dst_dir_or_file: str):
    src = os.path.abspath(src_file)
    dst = os.path.abspath(dst_dir_or_file)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    return shutil.copy(src, dst)


class Main:
    def __init__(self) -> None:
        self.self_path = os.path.abspath(sys.argv[0])
        self.root_dir = os.path.dirname(os.path.dirname(self.self_path))

        self.config = load_config([
            "./config.json",
            os.path.join(self.root_dir, "config-default.json"),
        ])

        self.dist_dir = self.config["dist_dir"]
        self.manifests_dir = os.path.join(self.dist_dir, "manifests")
        self.res_dir = os.path.join(self.dist_dir, "res")

        self.content_dir = self.config["content_dir"]
        self.articles_dir = os.path.join(self.content_dir, "articles")
        self.virtual_root_dir = os.path.join(self.content_dir, "root")

        self.ensure_dirs_exists()
        self.articles()
        self.virtual_root()
        # self.download("https://unpkg.com/mathjax@3.2.0/es5/tex-mml-chtml.js", "mathjax.js")

        # Copy compiled wasm files to dist_dir
        # root_dist = os.path.join(self.root_dir, "frontend/dist")
        # if os.path.abspath(root_dist) != os.path.abspath(self.dist_dir):
        #     copy_dir(root_dist, self.dist_dir)

    def ensure_dirs_exists(self):
        for d in [
            self.dist_dir,
            self.manifests_dir,
            self.res_dir
        ]:
            os.makedirs(d, exist_ok=True)

    def read_article(self, path: str):
        raw_article = read(path)

        article, content = split_front_matter(raw_article)
        article["content"] = content

        fallback = os.path.basename(os.path.dirname(path))+".json"
        article["manifest"] = article.get("manifest", fallback)

        for k in ["pub_time", "mod_time"]:
            article[k] = article.get(k, None)
            if not isinstance(article[k], str):
                continue
            t = time.strptime(article[k], self.config["datetime_format"])
            article[k] = time.mktime(t)

        return article

    def remap_article_images(self, article_dir: str, article: dict, res_files_map: dict):
        content = article["content"]
        images = re.findall(r"(!\[.*?\]\((.+?)\))", content)
        for img, old_name in images:
            origin = os.path.abspath(os.path.join(article_dir, old_name))
            if origin not in res_files_map:
                continue

            new_path = os.path.join("res", res_files_map[origin])
            new_img = img.replace(old_name, new_path)
            content = content.replace(img, new_img)
        article["content"] = content

    def shuffle_res_files(self, res_files: list):
        res_files_map = {}
        for origin in res_files:
            ext = os.path.basename(origin)
            ext = ext[ext.index("."):]
            new_name = hash_string(os.path.basename(origin))+ext
            while os.path.exists(os.path.join(self.res_dir, new_name)):
                new_name = hash_string(new_name)+ext
            new_path = os.path.join(self.res_dir, new_name)
            os.replace(copy_file(origin, self.res_dir), new_path)
            res_files_map[origin] = new_name
        return res_files_map

    def articles(self):
        index = {
            "title": self.config["blog_name"],
            "articles": []
        }

        for adir in ls_abs(self.articles_dir):
            files = ls_abs(adir)

            md_files = list(filter(lambda s: s.endswith(".md"), files))
            md_file = md_files[0]
            if len(md_files) > 1:
                print(f"There are more than one .md files in '{adir}'.\n"
                      f"    Only '{os.path.basename(md_file)}' would be used.")

            res_files = list(filter(lambda s: s not in md_files, files))
            res_files_map = self.shuffle_res_files(res_files)

            article = self.read_article(md_file)
            self.remap_article_images(adir, article, res_files_map)

            if adir.endswith("/index"):
                index["about"] = article["content"]
                continue

            manifest = article["manifest"]

            password = article.get("password", None)
            if password:
                data, iv = encrypt_string(json.dumps(article), password)
                data = base64.b64encode(data).decode()
                iv = base64.b64encode(iv).decode()
                article = {
                    "encrypted": True,
                    "data": data,
                    "iv": iv
                }
            else:
                index["articles"].append({
                    "title": article["title"],
                    "pub_time": article["pub_time"],
                    "manifest": manifest
                })

            manifest = os.path.join(self.manifests_dir, manifest)
            write(manifest, json.dumps(article))

        index["articles"].sort(key=lambda a: a["pub_time"], reverse=True)
        write(os.path.join(self.manifests_dir, "index.json"), json.dumps(index))

    def virtual_root(self):
        if not os.path.exists(self.virtual_root_dir):
            print(f"{self.virtual_root_dir} Not Exists.")
            return
        copy_dir(self.virtual_root_dir, self.dist_dir)

    def download(self, url: str, dst: str):
        resp = requests.get(url)
        resp.raise_for_status()
        dst = os.path.join(self.dist_dir, dst)
        write(dst, resp.content)


if __name__ == "__main__":
    Main()
