import { getManifest } from '../../../src-js/common';

let manifest = getManifest('index.json');
let wasm = new Promise((resolve, reject) => {
    Module['onRuntimeInitialized'] = function () {
        let _render_markdown = Module.cwrap('render_markdown_c', 'number', ['string']);
        let render_markdown = (s) => UTF8ToString(_render_markdown(s));
        resolve({ render_markdown: render_markdown });
    };
});

Promise.all([manifest, wasm]).then(([manifest, wasm]) => {
    document.title = manifest.title;

    document.getElementById("about").innerHTML = wasm.render_markdown(manifest.about);

    let elem_articles = document.getElementById("articles");
    elem_articles.innerHTML = "";
    manifest.articles.forEach((art) => {
        elem_articles.innerHTML += `<div><a href="article.html?${art.manifest}">${art.title}</a><small>${(new Date(art.pub_time * 1000)).toLocaleString()}</small></div>`
    });
})
