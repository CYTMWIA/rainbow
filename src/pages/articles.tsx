import axios from 'axios';
import { Manifest, fetch_manifest, format_time, mount_app, parse_query } from '../common';
import { decrypt } from '../crypto';
import { useEffect, useState } from 'react';

function Content() {
    const [articles, set_articles] = useState<Manifest.ArticlesListItem[]>([])

    let query = parse_query('articles_list.json')
    useEffect(() => {
        fetch_manifest(query.manifest, query.password).then((manifest) => {
            set_articles(manifest)
        })
    }, [query.manifest]);

    articles.sort((a, b) => {
        let at = a.pub_time ? a.pub_time : 0
        let bt = b.pub_time ? b.pub_time : 0
        return bt - at
    }) // 按发布时间降序
    const list = articles.map((art) => {
        return <li key={art.manifest}>
            <a href={`index.html?${art.manifest}`}>{art.title}</a>
            <div>{art.pub_time ? format_time(art.pub_time) : ''}</div>
        </li>
    })
    return <>
        <h1>Articles List</h1>
        <ul className="articles_list">{list}</ul>
    </>
}

mount_app(<Content></Content>)
