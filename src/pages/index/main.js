let index_json = null;
let render_markdown = null;

let ready = () => { return index_json !== null && render_markdown !== null; };
let first_run = (() => {
    let count = 0;
    let fun = () => {
        if (count == 0) { count += 1; return true; }
        return false;
    }
    return fun;
})();

function main() {
    if (!ready()) return;
    if (!first_run()) return;
    console.log("main() in JS started.")

    document.getElementById("about").innerHTML = render_markdown(index_json.about);
    document.getElementById("articles").innerHTML = "";
}

Module['onRuntimeInitialized'] = function () {
    let _render_markdown = Module.cwrap('render_markdown_c', 'number', ['string']);
    render_markdown = (s) => UTF8ToString(_render_markdown(s));
    main();
};

fetch("index.json").then((resp) => {
    return resp.json();
}, (reason) => {
    alert("获取 index.json 失败");
    console.log(reason);
}).then((obj) => {
    index_json = obj;
    main();
}, (reason) => {
    alert("解析 index.json 失败");
    console.log(reason);
});
