import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { Article, EncryptedArticle, parse_query } from './common';
import { decrypt } from './crypto';
import { useEffect, useState } from 'react';
import { marked } from 'marked';

function Content() {
    const [article, set_article] = useState<Article>({
        title: 'Loading...',
        manifest: '',
        pub_time: 0,
        mod_time: 0,
        content: ''
    })

    let query = parse_query('index.json')
    useEffect(() => {
        new Promise(async () => {
            let response = await axios.get(`manifests/${query.manifest}`)
            if (response.status !== 200) {
                alert(`${query.manifest} 获取失败`)
                return
            }

            let resp_data = response.data
            if ((resp_data as EncryptedArticle).iv) {
                let ea = resp_data as EncryptedArticle
                if (query.password !== null) {
                    let json_str = await decrypt(ea.data, ea.iv, query.password)
                    set_article(JSON.parse(json_str))
                }
            } else {
                set_article(response.data)
            }
        })
    }, [query.manifest]);

    const article_html = { __html: marked.parse(article.content) }
    return (<>
        <h1>{article.title}</h1>
        <article dangerouslySetInnerHTML={article_html}></article >
    </>)
}

const root = createRoot(document.getElementById('content'))
root.render(<Content></Content>)
