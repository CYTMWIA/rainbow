(() => {
    console.log("article.js running.");

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

    let manifest = (query[""] !== undefined) ? query[""] : query["manifest"];
    if (manifest === undefined) {
        alert("Lack of manifest.");
        return;
    }

    let manifest_json = null;
    fetch(`manifests/${manifest}`).then((resp) => {
        return resp.json();
    }, (reason) => {
        alert("获取 manifest 失败");
        console.log(reason);
    }).then((obj) => {
        manifest_json = obj;
        on_manifest_ready();
    }, (reason) => {
        alert("解析 manifest 失败");
        console.log(reason);
    });

    function on_manifest_ready() {
        if (manifest_json.encrypted === true) {
            console.log("Manifest was encrypted.");
            on_all_ready();
            return;
        }

        document.title = manifest_json.title;
        let meta_elem = document.getElementById("meta");
        let epoch2str = (ts) => (new Date(ts * 1000)).toLocaleString();
        meta_elem.innerHTML =
            `<h1>${manifest_json.title}</h1>`
            + "<table><tbody>"
            // + `<tr><td></td><td></td></<tr>`
            + `<tr><td>Published</td><td><strong>${epoch2str(manifest_json.pub_time)}</strong></td></<tr>`
            + `<tr><td>Modified</td><td><strong>${epoch2str(manifest_json.mod_time)}</strong></td></<tr>`
            + "</tbody></table>";

        on_all_ready();
    }

    let render_markdown = null, decrypt_string = null;
    Module["onRuntimeInitialized"] = function () {
        let _render_markdown = Module.cwrap("render_markdown_c", "number", ["string"]);
        render_markdown = (s) => UTF8ToString(_render_markdown(s));
        decrypt_string = Module.cwrap("decrypt_string", "number", ["string", "string", "string", "string"]);
        on_all_ready();
    };

    let ready = () => { return manifest_json !== null && render_markdown !== null; };
    let first_run = (() => {
        let count = 0;
        let fun = () => {
            if (count == 0) { count += 1; return true; }
            return false;
        }
        return fun;
    })();
    function on_all_ready() {
        if (!ready()) return;
        if (!first_run()) return;
        console.log("All resources are loaded.");

        if (manifest_json.encrypted === true) {
            console.log("Decrypting...");
            let key = query["password"] ? query["password"] : "";
            let res = decrypt_string(manifest_json.data, key, "CYTMWIA", "AES-256-CBC");
            if (-1 === res) {
                alert("Decrypt data failed.");
                return;
            }
            console.log("Success!");
            manifest_json = JSON.parse(UTF8ToString(res));
            on_manifest_ready();
        }

        let article_elem = document.getElementById("article");
        article_elem.innerHTML = render_markdown(manifest_json.content);
    }

    fetch("https://unpkg.com/mathjax@3.2.0/es5/tex-svg-full.js", { cache: "force-cache" })
        .then((resp) => resp.text())
        .then((text) => eval(text))
        .catch((reason) => {
            alert("Import mathjax failed.");
            console.error(reason);
        });
})();
