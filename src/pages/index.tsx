import axios from 'axios';
import { Manifest, add_script_node, fetch_manifest, mount_app, parse_query } from '../common';
import { decrypt } from '../crypto';
import { useEffect, useState } from 'react';
import { marked } from 'marked';

function Content() {
    const [article, set_article] = useState<Manifest.Article>({
        title: 'Loading...',
        pub_time: 0,
        mod_time: 0,
        content: ''
    })

    let query = parse_query('index.json')
    useEffect(() => {
        fetch_manifest(query.manifest, query.password).then((manifest) => {
            set_article(manifest)

            // https://www.mathjax.org/#gettingstarted
            add_script_node('https://polyfill.io/v3/polyfill.min.js?features=es6')
            add_script_node('https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js', { async_: true })
        })
    }, [query.manifest]);

    document.title = article.title

    const article_html = { __html: marked.parse(article.content) }
    return (<>
        <h1>{article.title}</h1>
        <article dangerouslySetInnerHTML={article_html}></article >
    </>)
}

mount_app(<Content></Content>)