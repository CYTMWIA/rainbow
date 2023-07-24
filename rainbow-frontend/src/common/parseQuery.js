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