import path from './src/path'
import { render } from "nunjucks";
const __dirname = import.meta.dir

// Configs

const output_dir = 'dist'
const templates_dir = path.join(__dirname, 'templates')
const pages = [
    {
        title: 'Index',
        entrypoint: path.join(__dirname, '/src/index.jsx'),
        path: 'index.html',
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
    }).then((output) => {
        if (output.success) {
            console.log('OK', page.entrypoint)
            build_result.scripts.push(path.basename(output.outputs[0].path))
        } else {
            console.error('FAIL', page.entrypoint)
            console.error(output)
        }
    })

    let final = { ...page, ...build_result }
    let html = render(path.join(templates_dir, 'page.html'), final)
    await Bun.write(path.join(output_dir, page.path), html)
})
