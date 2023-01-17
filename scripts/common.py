import datetime
import json
import os
from functools import partial

open = partial(open, encoding="utf-8")


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


def parse_timezone(s: str):
    signed = 1
    if s[0] == '-':
        signed = -1
        s = s[1:]
    elif s[0] == "+":
        s = s[1:]
    hours = signed * int(s[:2])
    mins = signed * int(s[-2:])
    return datetime.timezone(datetime.timedelta(hours=hours, minutes=mins))


def specialize_config(cfg: dict):
    cfg["timezone"] = parse_timezone(cfg["timezone"])


def load_config(paths=["./config.json", "./config-default.json"]):
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
    specialize_config(final)
    return final


def make_time_formatter(format: str, timezone: datetime.timezone):
    def func(utc_timestamp: float | int | None):
        if utc_timestamp == None:
            return ""
        dt = datetime.datetime.fromtimestamp(utc_timestamp, timezone)
        return dt.strftime(format)
    return func


if __name__ == "__main__":
    # Test
    print(load_config())
