import { ReactNode, useEffect, useState } from 'react';
import { Article } from './article';
import { ArticleList } from './article_list';

function changePath(path: string) {
    window.history.pushState(path, "", path)
}

function Index() {
    changePath('/index.html')
    return <Article manifest={'index'}></Article>
}

function Articles(props: { setArticle: (arg0: string) => void }) {
    changePath('/articles.html')
    return <ArticleList manifest={'articles_list'} setArticle={props.setArticle}></ArticleList>
}

function Links() {
    changePath('/links.html')
    return <Article manifest={'links'}></Article>
}

function About() {
    changePath('/about.html')
    return <Article manifest={'about'}></Article>
}

function split_path(path: string) {
    if (path.endsWith(".html"))
        path = path.substring(0, path.length - 5)
    let parts: string[] = []
    path.split(/\\|\//).forEach((p) => {
        if (!p.length) return;
        parts.push(p)
    })
    return parts
}

export function Rainbow(props: { children?: ReactNode }) {
    const [content, setContent] = useState<ReactNode>(props.children ? props.children : <></>)

    function setArticle(manifest: string) {
        changePath('/article.html?' + manifest)
        setContent(<Article manifest={manifest}></Article>)
    }

    const routes = [
        { pattern: "/index", content: <Index></Index> },
        { pattern: "/article", content: <Article></Article> },
        { pattern: "/articles", content: <ArticleList setArticle={setArticle} ></ArticleList> },
        { pattern: "/links", content: <Links></Links> },
        { pattern: "/about", content: <About></About> },
    ]
    useEffect(() => {
        let path = window.location.pathname
        let parts = split_path(path)
        let matched_idx = -1
        for (let r = 0; r < routes.length && matched_idx < 0; r += 1) {
            let route = routes[r]
            let pattern_parts = split_path(route.pattern)
            let m = 0, args: any = {}
            for (m = 0; m < pattern_parts.length; m += 1) {
                if (!parts[m]) {
                    break
                }
                let arg = pattern_parts[m].match(/<(.*?)>/)
                if (arg) {
                    args[arg[1]] = parts[m]
                } else if (parts[m] === pattern_parts[m]) {
                } else {
                    break
                }
                if (m === pattern_parts.length - 1) {
                    matched_idx = r
                }
            }
        }
        if (matched_idx < 0) {
            if (!props.children)
                setContent(<Index></Index>)
        } else {
            setContent(<>{routes[matched_idx].content}</>)
        }
    }, [])

    return <>
        <div className='menu'>
            <div onClick={() => setContent(<Index></Index>)}>Home</div>
            <div onClick={() => setContent(<Articles setArticle={setArticle}></Articles>)}>Articles</div>
            <div onClick={() => setContent(<Links></Links>)}>Links</div>
            <div onClick={() => setContent(<About></About>)} className='bottom'>About</div>
        </div>
        <div className='content'>
            {content}
        </div>
    </>
}
