#! venv/bin/python

import json
import os

DIST_DIR = "./dist"
CONTENT_DIR = "./content"


def ls(path: str):
    return [os.path.join(path, p) for p in os.listdir(path)]


def lsr(path: str):
    paths = []
    for next_path in ls(path):
        if os.path.isdir(next_path):
            paths += lsr(next_path)
        else:
            paths.append(next_path)
    return paths


class Config(dict):
    def __init__(self, raw_dict: dict):
        super().__init__(raw_dict)

    @staticmethod
    def load(paths):
        cfgs = []
        for p in paths:
            if not os.path.exists(p):
                continue
            with open(p, "r") as f:
                cfgs.append(json.load(f))
        final = cfgs[-1]
        for cfg in cfgs[:-1][::-1]:
            for key in cfg:
                final[key] = cfg[key]
        final = Config(final)
        return final


def load_config(paths=["./config.json", "./config-default.json"]):
    return Config.load(paths)


def split_front_matter(raw_text: str):
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


if __name__ == "__main__":
    # Test
    config = load_config()
