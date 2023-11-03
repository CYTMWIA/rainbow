import { useContext, useEffect, useState } from 'react';
import { Manifest, fetch_manifest, format_time, parse_query } from '../common';
import { RainbowContext } from './rainbow';
import { FadeInOut } from './fade_in_out';

export function ArticleList(props: { manifest?: string }) {
    const rainbow = useContext(RainbowContext)
    const [articles, set_articles] = useState<Manifest.ArticlesListItem[]>([])

    document.title = 'Articles List'

    let query = parse_query('articles_list.json')
    let manifest_file = props.manifest ? props.manifest : query.manifest
    if (!manifest_file.endsWith('.json')) manifest_file += '.json'
    useEffect(() => {
        fetch_manifest(manifest_file, query.password).then((manifest) => {
            set_articles(manifest)
        })
    }, [manifest_file]);

    articles.sort((a, b) => {
        let at = a.pub_time ? a.pub_time : 0
        let bt = b.pub_time ? b.pub_time : 0
        return bt - at
    }) // 按发布时间降序
    const list = articles.map((art) => {
        return <li key={art.manifest}>
            <div onClick={() => rainbow.setPath("/article.html?" + art.manifest)}>{art.title}</div>
            <div>{art.pub_time ? format_time(art.pub_time) : ''}</div>
        </li>
    })
    return <FadeInOut>
        <h1>Articles List</h1>
        <ul className="articles_list">{list}</ul>
    </FadeInOut>
}
