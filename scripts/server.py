import os
import subprocess
import time

from common import load_config, lsr


def main():
    config = load_config()
    subprocess.Popen(["python", "-m", "http.server"], cwd=config["output_dir"])
    last = 0
    while True:
        latest = sorted([os.path.getmtime(p) for p in lsr("./content")])[-1]
        if last != latest:
            subprocess.run([config["server_python_path"], "scripts/build.py"])
        last = latest
        time.sleep(1)


if __name__ == "__main__":
    main()
