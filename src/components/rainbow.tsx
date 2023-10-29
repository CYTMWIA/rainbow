import { ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { Article } from './article';
import { ArticleList } from './article_list';

function Index() {
    return <Article manifest={'index'}></Article>
}

function Links() {
    return <Article manifest={'links'}></Article>
}

function About() {
    return <Article manifest={'about'}></Article>
}

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
    setPath: React.Dispatch<React.SetStateAction<string>>
}

export const RainbowContext = createContext<RainbowContext>({
    path: '',
    setPath: function (_value: SetStateAction<string>): void {
        throw new Error('Function not implemented.');
    }
})

function Menu() {
    const rainbow = useContext(RainbowContext)

    return <div className='menu'>
        <div onClick={() => rainbow.setPath('/index.html')}>Home</div>
        <div onClick={() => rainbow.setPath('/articles.html')}>Articles</div>
        <div onClick={() => rainbow.setPath('/links.html')}>Links</div>
        <div onClick={() => rainbow.setPath('/about.html')} className='bottom'>About</div>
    </div>
}

function Content(props: { children?: ReactNode }) {
    const rainbow = useContext(RainbowContext)

    let content = props.children ? props.children : <></>
    const routes = [
        { pattern: "/index", content: <Index></Index> },
        { pattern: "/article", content: <Article></Article> },
        { pattern: "/articles", content: <ArticleList></ArticleList> },
        { pattern: "/links", content: <Links></Links> },
        { pattern: "/about", content: <About></About> },
    ]
    let path_parts = split_path(rainbow.path)
    let matched_idx = -1
    for (let r = 0; r < routes.length && matched_idx < 0; r += 1) {
        let route = routes[r]
        let pattern_parts = split_path(route.pattern)
        let m = 0, args: any = {}
        for (m = 0; m < pattern_parts.length; m += 1) {
            if (!path_parts[m]) {
                break
            }
            let arg = pattern_parts[m].match(/<(.*?)>/)
            if (arg) {
                args[arg[1]] = path_parts[m]
            } else if (path_parts[m] === pattern_parts[m]) {
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
            content = <Index></Index>
    } else {
        content = routes[matched_idx].content
    }

    return <div className='content'>{content}</div>
}

export function Rainbow(props: { children?: ReactNode }) {
    const [path, setPath] = useState(window.location.pathname + window.location.search)
    window.history.pushState(path, "", path)
    window.onpopstate = () => {
        setPath(window.location.pathname)
    }

    return <>
        <RainbowContext.Provider value={{ path: path, setPath: setPath }}>
            <Menu></Menu>
            <Content>{props.children}</Content>
        </RainbowContext.Provider>
    </>
}
