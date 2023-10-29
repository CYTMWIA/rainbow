/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
// https://bun.sh/docs/typescript#dom-types

import { basename, join } from "path";
import { render } from "nunjucks";
import { compile as compileSass } from "sass";

const __dirname = import.meta.dir

type PageDeclare = {
    title: string,
    entrypoint: string,
    stylesheets?: string[],
    path?: string,
}
type Page = Required<PageDeclare>

// Configs

const output_dir = 'dist'
const templates_dir = join(__dirname, 'templates')
const pages: PageDeclare[] = [
    // Blog
    {
        title: 'Index',
        entrypoint: join(__dirname, '/src/pages/index.tsx'),
    },
    {
        title: 'Article',
        entrypoint: join(__dirname, '/src/pages/index.tsx'),
    },
    {
        title: 'Articles',
        entrypoint: join(__dirname, '/src/pages/index.tsx'),
    },
    {
        title: 'Links',
        entrypoint: join(__dirname, '/src/pages/index.tsx'),
    },
    {
        title: 'About',
        entrypoint: join(__dirname, '/src/pages/index.tsx'),
    },
    // Tools
    {
        title: 'Tools',
        entrypoint: join(__dirname, '/src/pages/tools.tsx'),
    },
    {
        title: 'Numbers In Text',
        entrypoint: join(__dirname, '/src/pages/numbers_in_text.tsx'),
    },
    {
        title: 'Timestamp',
        entrypoint: join(__dirname, '/src/pages/timestamp.tsx'),
    },
]
const default_page_value = {
    stylesheets: ['style.css'],
    path: (page: PageDeclare) => {
        return page.title.toLocaleLowerCase().replaceAll(' ', '_') + '.html'
    }
}

// Build

// Merge CSS
let final_css = (await Bun.file(join(__dirname, 'stylesheets/style.css')).text()) + '\n'
final_css += compileSass(join(__dirname, 'node_modules/heti/lib/heti.scss')).css + '\n'
await Bun.write(join(output_dir, 'style.css'), final_css)

await Promise.all(pages.map(async (page_declare) => {
    let page: Page = {
        title: page_declare.title,
        entrypoint: page_declare.entrypoint,
        stylesheets: page_declare.stylesheets ? page_declare.stylesheets : default_page_value.stylesheets,
        path: page_declare.path ? page_declare.path : default_page_value.path(page_declare)
    }
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
}))
