import { copyFile, exists, lstat, mkdir, readFile, readdir } from "fs/promises"
import { basename, dirname, extname, join } from "path"
import { parse, stringify } from 'yaml'
import { encrypt } from "./src/crypto"
import { Article, Manifest } from "./src/common"

const output_dir = 'dist'
const content_dir = 'content'

function get_manifest_name(article_path: string) {
    return basename(article_path, '.md') + '.json'
}

async function output_manifest(name: string, obj: any) {
    let manifests_dir = join(output_dir, 'manifests')
    await mkdir(manifests_dir, { recursive: true })
    let output_file = join(manifests_dir, name)
    await Bun.write(output_file, JSON.stringify(obj))
}

async function output_article(article: Article) {
    let obj
    if (article.encrypt) {
        (<Manifest.EncryptedManifest><unknown>obj) = {
            data: article.encrypt.data,
            iv: article.encrypt.iv
        }
    } else {
        (<Manifest.Article><unknown>obj) = {
            title: article.title,
            pub_time: article.pub_time,
            mod_time: article.mod_time,
            content: article.content
        }
    }
    await output_manifest(get_manifest_name(article.fs_path), obj)
}

async function find_md_file(path: string) {
    let stat = await lstat(path)
    if (stat.isDirectory()) {
        let subfiles = await readdir(path)
        let res = null
        await Promise.all(subfiles.map(async (file) => {
            let sub = await find_md_file(join(path, file))
            if (sub) res = sub
        }))
        return res
    } else if (extname(path) == '.md')
        return path
    return null
}

async function parse_article_file(path: string): Promise<Article> {
    let result: Article = {
        fs_path: path,
        title: 'Untitled',
        content: '',
    }
    let raw = (await readFile(path)).toString('utf-8')
    let meta_split = raw.match(/[^\n]\s*?---\s*?[$\n]/)
    if (meta_split !== null && meta_split.index) {
        result.content = raw.substring(meta_split.index + meta_split[0].length)
        let meta = parse(raw.substring(0, meta_split.index + 1))
        result = { ...result, ...meta }
        if (meta.password) {
            let plain = JSON.stringify(result)
            let encrypted = await encrypt(plain, meta.password)
            result.encrypt = {
                password: meta.password,
                data: encrypted.data,
                iv: encrypted.iv
            }
        }
        ['pub_time', 'mod_time'].forEach((time) => {
            if (meta[time]) {
                if (typeof meta[time] === 'string') {
                    (<any>result)[time] = Date.parse(meta[time])
                } else if (typeof meta[time] === 'number') {
                    (<any>result)[time] = meta[time]
                } else {
                    console.warn('Unknown type of time')
                }
            }
        })
    } else result.content = raw
    return result
}

async function process_article(path: string) {
    let stat = await lstat(path)

    let article_file = path
    if (stat.isDirectory()) {
        let inner = await find_md_file(path)
        if (inner)
            article_file = inner
        else {
            console.log(`Article not found in ${path}`)
            return null
        }
    }

    let article = await parse_article_file(article_file)
    if (stat.isDirectory()) {
        article.fs_path = path

        let siblings = await readdir(path)
        await Promise.all(siblings.map(async (filename) => {
            let filepath = join(path, filename)
            if (!(await lstat(filepath)).isDirectory()) {
                let ext = extname(filename)
                if ('.md' === ext) { }
                else {
                    let copyto = join(output_dir, filename)
                    if (await exists(copyto))
                        console.warn(`Overwriting ${copyto}`)
                    await copyFile(filepath, join(output_dir, filename))
                }
            }
        }))

    }

    await output_article(article)
    return article
}

let files = await readdir(content_dir)
await Promise.all(files.map(async (filename) => {
    if (['root', 'tmp'].includes(filename)) {
        // files handled by bash script
        return null
    }

    if (filename === 'articles') {
        let articles_dir = join(content_dir, filename)
        let article_dirs = await readdir(articles_dir)
        let articles: Manifest.ArticlesListItem[] = []
        await Promise.all(article_dirs.map(async (adir) => {
            let res = await process_article(join(articles_dir, adir))
            if (res) {
                if (!res.encrypt)
                    articles.push({
                        title: res.title,
                        pub_time: res.pub_time,
                        manifest: get_manifest_name(res.fs_path)
                    })
            }
        }))
        await output_manifest('_articles.json', articles)
    } else {
        await process_article(join(content_dir, filename))
    }
}))
