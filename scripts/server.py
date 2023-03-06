#! venv/bin/python

import os
import subprocess
import time

from common import load_config, ls, lsr


def main():
    config = load_config()
    subprocess.Popen(["python", "-m", "http.server", "3369"], cwd=config["output_dir"])
    last = 0
    while True:
        watch = (
            ls("./")
            + lsr("./scripts")
            + lsr(config["templates_dir"])
            + lsr(config["content_dir"])
        )
        latest = tuple([os.path.getmtime(p) for p in watch])
        if last != latest:
            subprocess.run([config.server_python_path, "scripts/build.py"])
        last = latest
        time.sleep(1)


if __name__ == "__main__":
    main()
