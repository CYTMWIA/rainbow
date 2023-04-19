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

    document.title = index_json.title;

    document.getElementById("about").innerHTML = render_markdown(index_json.about);

    let elem_articles = document.getElementById("articles");
    elem_articles.innerHTML = "";
    index_json.articles.forEach((art) => {
        elem_articles.innerHTML += `<div><a href="article.html?${art.manifest}">${art.title}</a><small>${(new Date(art.pud_time*1000)).toLocaleString()}</small></div>`
    });
}

Module['onRuntimeInitialized'] = function () {
    let _render_markdown = Module.cwrap('render_markdown_c', 'number', ['string']);
    render_markdown = (s) => UTF8ToString(_render_markdown(s));
    main();
};

fetch("manifests/index.json").then((resp) => {
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
