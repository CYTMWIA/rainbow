import Heti from 'heti/js/heti-addon.js';
import { marked } from 'marked';
import { useEffect, useState } from 'react';
import { Manifest, fetch_manifest, parse_query } from '../common';
import { FadeInOut } from './fade_in_out';

export function Article(props: { manifest?: string }) {
    const [article, set_article] = useState<Manifest.Article>({
        title: 'Loading...',
        pub_time: 0,
        mod_time: 0,
        content: ''
    })

    let query = parse_query('index.json')
    let manifest_file = props.manifest ? props.manifest : query.manifest
    if (!manifest_file.endsWith('.json')) manifest_file += '.json'
    useEffect(() => {
        fetch_manifest(manifest_file, query.password).then((manifest) => {
            set_article(manifest)

            // https://www.mathjax.org/#gettingstarted
            // add_script_node('https://polyfill.io/v3/polyfill.min.js?features=es6')
            // add_script_node('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js', { async_: true })
        })
    }, [manifest_file])
    useEffect(() => {
        const heti = new Heti('.heti')
        heti.autoSpacing()
    }) // run the effect after every render

    document.title = article.title

    marked.use({
        gfm: true,
    });
    const article_html = { __html: marked.parse(article.content) }
    return <FadeInOut>
        <h1>{article.title}</h1>
        <article dangerouslySetInnerHTML={article_html} className='heti heti--sans'></article >
    </FadeInOut>
}
