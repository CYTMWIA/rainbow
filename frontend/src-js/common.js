export function parseQuery() {
    let qstr = document.location.search;
    let query = {}, state = "NONE", begin = 0, key = "";
    for (let i = 0; i < qstr.length; i += 1) {
        if (state === "NONE") {
            if ("?&".indexOf(qstr[i]) !== -1) {
            } else {
                begin = i;
                state = "KEY";
            }
        } else if (state === "KEY") {
            if (i + 1 === qstr.length) {
                query[""] = qstr.substring(begin, qstr.length);
                state = "NONE";
            }
            else if (qstr[i] === "&") {
                query[""] = qstr.substring(begin, i);
                state = "NONE";
            } else if (qstr[i] == "=") {
                key = qstr.substring(begin, i);
                begin = i + 1;
                state = "VALUE";
            }
        } else if (state === "VALUE") {
            if (i + 1 === qstr.length) {
                query[key] = qstr.substring(begin, qstr.length);
                state = "NONE";
            } else if (qstr[i] === "&") {
                query[key] = qstr.substring(begin, i);
                state = "NONE";
            }
        }
    }
    return query;
}

export function getManifest(manifest) {
    return fetch(`manifests/${manifest}`).then((resp) => {
        return resp.json();
    }, (reason) => {
        alert("获取 manifest 失败（文件不存在？）");
        console.log(reason);
    }).then((obj) => {
        return obj;
    }, (reason) => {
        alert("解析 manifest 失败（文件格式有误？）");
        console.log(reason);
    });
}
