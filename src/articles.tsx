import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { Article, EncryptedArticle, format_time, parse_query } from './common';
import { decrypt } from './crypto';
import { useEffect, useState } from 'react';
import { marked } from 'marked';

function random_background_color() {
    let h = (Math.random() * 360).toString() + 'deg'
    let s = (Math.random() * 100) + '%'
    let l = (80 + Math.random() * 15) + '%'
    document.body.style.backgroundColor = `hsl(${h}, ${s}, ${l})`
}

function Content() {
    const [articles, set_articles] = useState<Article[]>([])

    let query = parse_query('_articles.json')
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
                    set_articles(JSON.parse(json_str))
                }
            } else {
                set_articles(resp_data)
            }
        })
    }, [query.manifest]);

    articles.sort((a, b) => b.pub_time - a.pub_time) // 按发布时间降序
    const list = articles.map((art) => {
        return <li key={art.title}>
            <a href={`index.html?`}>{art.title}</a>
            <div>{format_time(art.pub_time)}</div>
        </li>
    })
    return <>
        <h1>Articles List</h1>
        <ul className="articles_list">{list}</ul>
    </>
}

random_background_color()
const root = createRoot(document.getElementById('content'))
root.render(<Content></Content>)
