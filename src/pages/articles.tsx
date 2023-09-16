import axios from 'axios';
import { Article, ArticlesListItem, EncryptedArticle, format_time, mount_app, parse_query } from '../common';
import { decrypt } from '../crypto';
import { useEffect, useState } from 'react';

function Content() {
    const [articles, set_articles] = useState<ArticlesListItem[]>([])

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
        return <li key={art.manifest}>
            <a href={`index.html?${art.manifest}`}>{art.title}</a>
            <div>{format_time(art.pub_time)}</div>
        </li>
    })
    return <>
        <h1>Articles List</h1>
        <ul className="articles_list">{list}</ul>
    </>
}

mount_app(<Content></Content>)
