const __dirname = import.meta.dir

// Configs

const outdir = 'dist'
const pages = [
    {
        'title': 'Index',
        'entrypoint': __dirname + '/src/index.jsx'
    }
]

// Build

pages.forEach(async (page, idx) => {
    await Bun.build({
        entrypoints: [page.entrypoint],
        outdir: outdir,
    }).then((output) => {
        if (output.success) {
            console.log('OK', page.entrypoint)
        } else {
            console.error('FAIL', page.entrypoint)
            console.error(output)
        }
    })
})

