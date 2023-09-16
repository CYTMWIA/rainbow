/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
// https://bun.sh/docs/typescript#dom-types

import { basename, join } from "path";
import { render } from "nunjucks";

const __dirname = import.meta.dir

// Configs

const output_dir = 'dist'
const templates_dir = join(__dirname, 'templates')
const pages = [
    {
        title: 'Index',
        entrypoint: join(__dirname, '/src/index.jsx'),
        path: 'index.html',
        stylesheets: ['style.css']
    },
    {
        title: 'Articles',
        entrypoint: join(__dirname, '/src/articles.jsx'),
        path: 'articles.html',
        stylesheets: ['style.css']
    }
]

// Build

pages.forEach(async (page) => {
    let build_result: {
        scripts: string[]
    } = {
        scripts: []
    }

    await Bun.build({
        entrypoints: [page.entrypoint],
        outdir: output_dir,
        minify: true,
    }).then((output) => {
        if (output.success) {
            console.log('OK', page.entrypoint)
            build_result.scripts.push(basename(output.outputs[0].path))
        } else {
            console.error('FAIL', page.entrypoint)
            console.error(output)
        }
    })

    let final = { ...page, ...build_result }
    let html = render(join(templates_dir, 'page.html'), final)
    await Bun.write(join(output_dir, page.path), html)
})
