import json
import os
import subprocess
import sys
import time
from collections import namedtuple

from common import load_config, open, split_front_matter

GitStatusPath = namedtuple("GitStatusPath", ["state", "path", "orig_path"])


def git_status():
    # https://git-scm.com/docs/git-status#_output
    args = ["git", "status", "-s", "-z"]
    proc = subprocess.run(args, stdout=subprocess.PIPE)
    paths = filter(len, proc.stdout.split(b"\0"))
    encoding = sys.stdout.encoding
    paths = list(map(lambda b: b.decode(encoding), paths))
    res = []
    idx = 0
    while idx < len(paths):
        state, path = paths[idx].split(maxsplit=1)
        if "R" in state:
            orig_path = paths[idx+1]
            idx += 1
        else:
            orig_path = None
        res.append(GitStatusPath(state, path, orig_path))
        idx += 1
    return res


def main():
    config = load_config()
    content_dir = os.path.abspath(config["content_dir"])
    paths = filter(lambda p: "M" in p.state, git_status())
    paths = map(lambda p: os.path.abspath(p.path), paths)
    for path in paths:
        if path.startswith(content_dir):
            with open(path, "r") as f:
                raw = f.read()
            front, text = split_front_matter(raw)
            if not len(front):
                continue
            print("UPDATE", path)
            front["mod_time"] = config.format_datetime_full(time.time())
            new_raw = json.dumps(front, indent=4)+"\n"+text
            with open(path, "w") as f:
                f.write(new_raw)


if __name__ == "__main__":
    main()
