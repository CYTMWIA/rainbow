import { ReactNode, SetStateAction, createContext, useContext, useEffect, useState } from 'react';
import { Article } from './article';
import { ArticleList } from './article_list';
import { FadeInOut } from './fade_in_out';

function split_path(path: string) {
    path = /[^\?]*/.exec(path)?.[0] ?? ''
    if (path.endsWith(".html"))
        path = path.substring(0, path.length - 5)
    let parts: string[] = []
    path.split(/\\|\//).forEach((p) => {
        if (!p.length) return;
        parts.push(p)
    })
    return parts
}

interface RainbowContext {
    path: string,
    setPath: (path: string) => void
}

export const RainbowContext = createContext<RainbowContext>({
    path: '',
    setPath: function (_value: SetStateAction<string>): void {
        throw new Error('Function not implemented.');
    }
})

function Menu() {
    const rainbow = useContext(RainbowContext)

    return <div className='menu animation-fade-in'>
        <div onClick={() => rainbow.setPath('/index.html')}>Home</div>
        <div onClick={() => rainbow.setPath('/articles.html')}>Articles</div>
        <div onClick={() => rainbow.setPath('/links.html')}>Links</div>
        <div onClick={() => rainbow.setPath('/about.html')} className='bottom'>About</div>
    </div>
}

function Content(props: { children?: ReactNode }) {
    const { path } = useContext(RainbowContext)
    const [content, setContent] = useState(props.children ? props.children : <></>)

    useEffect(() => {
        const routes = [
            { pattern: "/", content: <Article manifest={'index'}></Article> },
            { pattern: "/index", content: <Article manifest={'index'}></Article> },
            { pattern: "/article", content: <Article></Article> },
            { pattern: "/articles", content: <ArticleList manifest='articles_list.json'></ArticleList> },
            { pattern: "/links", content: <Article manifest={'links'}></Article> },
            { pattern: "/about", content: <Article manifest={'about'}></Article> },
        ]
        let path_parts = split_path(path)
        let matched_idx = -1
        for (let r = 0; r < routes.length && matched_idx < 0; r += 1) {
            let route = routes[r]
            let pattern_parts = split_path(route.pattern)
            let m = 0, args: any = {}, all_matched = path_parts.length == pattern_parts.length
            for (m = 0; m < pattern_parts.length && all_matched; m += 1) {
                if (!path_parts[m]) {
                    all_matched = false
                }
                let arg = pattern_parts[m].match(/<(.*?)>/)
                if (arg) {
                    args[arg[1]] = path_parts[m]
                } else if (path_parts[m] === pattern_parts[m]) {
                } else {
                    all_matched = false
                }
            }
            if (all_matched) {
                matched_idx = r
            }
        }
        if (matched_idx >= 0) {
            setContent(routes[matched_idx].content)
        }
    }, [path])

    return <FadeInOut><div className='content'>{content}</div></FadeInOut>
}

export function Rainbow(props: { children?: ReactNode }) {
    const [path, setPathRaw] = useState(window.location.pathname + window.location.search)
    const setPath = (path: string) => {
        setPathRaw(path)
        window.history.pushState(path, "", path)
    }
    window.onpopstate = () => {
        setPathRaw(window.location.pathname + window.location.search)
    }

    return <>
        <RainbowContext.Provider value={{ path: path, setPath: setPath }}>
            <Menu></Menu>
            <Content>{props.children}</Content>
        </RainbowContext.Provider>
    </>
}
