
<script setup>
import { ref } from 'vue'
import MarkdownIt from "markdown-it";
import katex from 'katex'

const props = defineProps(['raw'])

let renderer = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true
})

function render(raw) {
    let math = raw.replace(/\$\$(.*?)\$\$/g, function (outer, inner) {
        return katex.renderToString(inner, { displayMode: true })
    }).replace(/\\\[(.*?)\\\]/g, function (outer, inner) {
        return katex.renderToString(inner, { displayMode: true })
    }).replace(/\\\((.*?)\\\)/g, function (outer, inner) {
        return katex.renderToString(inner, { displayMode: false })
    });
    let html = renderer.render(math)
    return html
}
</script>
  
<template>
    <article v-html="render(props.raw)">
    </article>
</template>
  
<style>
.katex-html {
    display: none;
}

/******************************/
/* Common */
/******************************/

article p {
    line-height: 1.6;
}

article img {
    max-width: 100%;
    /* border-radius: 6px; */
    display: flex;
    margin-top: 1ch;
    margin-bottom: 1ch;
    margin-left: auto;
    margin-right: auto;
}

/******************************/
/* Code */
/******************************/

article pre,
article code {
    background-color: whitesmoke;
    padding: .1em .4em;
    /* border-radius: 6px; */
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
}

article pre>code {
    padding: 0;
    background-color: unset;
}

/******************************/
/* Quote */
/******************************/

article blockquote {
    border-left: solid;
    border-left-width: thick;
    border-left-color: darkgray;
    background: whitesmoke;
    padding-left: 1ch;
}

/******************************/
/* Table */
/******************************/

article table {
    margin-left: auto;
    margin-right: auto;
    min-width: 50%;
    border-collapse: collapse;
}

article table>* {
    margin-left: auto;
    margin-right: auto;
}

article th,
article td {
    border: solid 1px darkgray;

}

article table tbody tr:nth-child(2n-1) {
    background-color: gainsboro;
}
</style>
  