#! venv/bin/python

import base64
import datetime
import json
import math
import os
import shutil
import time

import common
import requests
from common import load_config, ls, split_front_matter
from cryptography.hazmat.primitives import padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes


def get_cipher(password: str):
    key_len = algorithms.AES256.key_size//8
    iv_len = algorithms.AES256.block_size//8
    total = key_len+iv_len
    password = password.encode("utf-8")
    password = (password*(int(total/len(password))+1))[:total]
    key = password[:key_len]
    iv = password[key_len:]
    return Cipher(algorithms.AES256(key), modes.CBC(iv))


def encrypt_string(s: str, password: str):
    cipher = get_cipher(password)
    encryptor = cipher.encryptor()
    padder = padding.PKCS7(cipher.algorithm.block_size).padder()

    data = s.encode("utf-8")
    data = padder.update(data) + padder.finalize()
    data = encryptor.update(data) + encryptor.finalize()
    return data


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


def copy(src: str, dst: str):
    src = os.path.abspath(src)
    dst = os.path.abspath(dst)

    print(f"COPY {src} -> {dst}")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if os.path.isdir(src):
        shutil.copytree(src, dst)
    else:
        shutil.copy(src, dst)


class Main:
    def __init__(self) -> None:
        self.config = load_config()
        self.dist_dir = self.config["dist_dir"]
        self.content_dir = self.config["content_dir"]

        self.articles()
        self.root()
        # self.download("https://unpkg.com/mathjax@3.2.0/es5/tex-mml-chtml.js", "mathjax.js")

    def articles(self):
        index = {
            "title": self.config["blog_name"],
            "articles": []
        }

        articles_dir = os.path.join(self.content_dir, "articles")
        manifests_dir = os.path.join(self.dist_dir, "manifests")
        os.makedirs(manifests_dir, exist_ok=True)
        # TODO: redirect url in articles
        # res_dir = os.path.join(self.dist_dir, "res")
        res_dir = self.dist_dir
        os.makedirs(res_dir, exist_ok=True)

        for adir in ls(articles_dir):
            files = ls(adir)
            md_files = list(filter(lambda s: s.endswith(".md"), files))
            res_files = list(filter(lambda s: s not in md_files, files))

            for f in res_files:
                copy(f, res_dir)

            md_file = md_files[0]
            if len(md_files) > 1:
                print(f"There are more than one .md files in '{adir}'.\n"
                      f"    Only '{os.path.basename(md_file)}' would be used.")

            if adir.endswith("/index"):
                index["about"] = read(md_file)
                continue

            raw_article = read(md_file)
            article, content = split_front_matter(raw_article)
            article["content"] = content
            article["manifest"] = manifest = os.path.basename(adir)+".json"

            for k in ["pub_time", "mod_time"]:
                article[k] = article.get(k, None)
                if not isinstance(article[k], str):
                    continue
                t = time.strptime(article[k], self.config["datetime_format"])
                article[k] = time.mktime(t)

            password = article.get("password", None)
            if password:
                data = encrypt_string(json.dumps(article), password)
                article = {
                    "data": base64.b64encode(data).decode(),
                    "encrypted": True
                }
            else:
                index["articles"].append({
                    "title": article["title"],
                    "pub_time": article["pub_time"],
                    "manifest": manifest
                })

            manifest = os.path.join(manifests_dir, manifest)
            write(manifest, json.dumps(article))

        index["articles"].sort(key=lambda a: a["pub_time"], reverse=True)
        write(os.path.join(manifests_dir, "index.json"), json.dumps(index))

    def root(self):
        root_dir = os.path.join(self.content_dir, "root")
        if not os.path.exists(root_dir):
            print(f"{root_dir} Not Exists.")
            return
        for f in ls(root_dir):
            copy(f, self.dist_dir)

    def download(self, url: str, dst: str):
        resp = requests.get(url)
        resp.raise_for_status()
        dst = os.path.join(self.dist_dir, dst)
        write(dst, resp.content)


if __name__ == "__main__":
    Main()
