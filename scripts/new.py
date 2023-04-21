#! venv/bin/python
import json
import os
import time

import common


def main():
    date = time.strftime("%Y%m%d")

    folder = os.path.join(common.CONTENT_DIR, "articles", f"{date}")
    os.makedirs(folder, exist_ok=True)

    path = os.path.join(folder, "content.md")
    with open(path, "a", encoding="utf-8") as f:
        t = time.time()
        f.write(json.dumps({
            "title": "Title",
            "pub_time": t,
            "mod_time": t
        }, indent=4))
    print("CREATE", path)


if __name__ == "__main__":
    main()
