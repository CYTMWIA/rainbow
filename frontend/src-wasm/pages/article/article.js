import { parseQuery, getManifest } from '../../../src-js/common';

console.log("article.js running.");

let query = parseQuery();

let manifest_file = (query[""] !== undefined) ? query[""] : query["manifest"];
if (manifest_file === undefined) {
    alert("缺少 manifest 文件");
    throw new Error("Lack of manifest.");
}

let manifest = getManifest(manifest_file);

let wasm = new Promise((resolve, reject) => {
    Module["onRuntimeInitialized"] = function () {
        let _render_markdown = Module.cwrap("render_markdown_c", "number", ["string"]);
        let render_markdown = (s) => UTF8ToString(_render_markdown(s));
        let decrypt_string = Module.cwrap("decrypt_string", "number", ["string", "string", "string"]);
        resolve({ decrypt_string: decrypt_string, render_markdown: render_markdown })
    };
});

Promise.all([manifest, wasm]).then(([manifest, wasm]) => {
    if (manifest.encrypted === true) {
        console.log("Manifest was encrypted.");
        console.log("Decrypting...");
        let res = wasm.decrypt_string(manifest.data, query["password"], "AES-256-CBC");
        if (-1 === res) {
            alert("Decrypt data failed.");
            return;
        }
        console.log("Success!");
        manifest = JSON.parse(UTF8ToString(res));
    }

    document.title = manifest.title;
    let meta_elem = document.getElementById("meta");
    let epoch2str = (ts) => (new Date(ts * 1000)).toLocaleString();

    let html = `<h1>${manifest.title}</h1>`;
    html += "<table><tbody>";
    if (manifest.pub_time)
        html += `<tr><td>Published</td><td><strong>${epoch2str(manifest.pub_time)}</strong></td></<tr>`;
    if (manifest.mod_time)
        html += `<tr><td>Modified</td><td><strong>${epoch2str(manifest.mod_time)}</strong></td></<tr>`;
    html += "</tbody></table>";

    meta_elem.innerHTML = html;

    let article_elem = document.getElementById("article");
    article_elem.innerHTML = wasm.render_markdown(manifest.content);

    // TODO: load mathjax.js early but start late (when article was completed)
    fetch("mathjax.js", { cache: "force-cache" })
        .then((resp) => resp.text())
        .then((text) => eval(text))
        .catch((reason) => {
            alert("Import mathjax failed.");
            console.error(reason);
        });
})
