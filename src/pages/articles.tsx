import axios from 'axios';
import { Manifest, fetch_manifest, format_time, mount_app, parse_query } from '../common';
import { decrypt } from '../crypto';
import { useEffect, useState } from 'react';

function Content() {
    const [articles, set_articles] = useState<Manifest.ArticlesListItem[]>([])

    let query = parse_query('_articles.json')
    useEffect(() => {
        fetch_manifest(query.manifest, query.password).then((manifest) => {
            set_articles(manifest)
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
