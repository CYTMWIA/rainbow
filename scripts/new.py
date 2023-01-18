import itertools
import json
import os
import time

from common import load_config, open


def main():
    config = load_config()
    date = time.strftime("%Y%m%d")
    for idx in itertools.count(start=1):
        filename = f"{date}-{idx}.md"
        path = os.path.join(config["content_dir"], filename)
        if not os.path.exists(path):
            break
    with open(path, "w") as f:
        f.write(json.dumps({
            "title": filename,
            "pub_time": config.format_datetime_full(time.time()),
            "mod_time": None
        }, indent=4))
    print("CREATE", path)


if __name__ == "__main__":
    main()
