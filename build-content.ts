import { lstat, mkdir, readFile, readdir } from "fs/promises";
import { basename, extname, join } from "path";
import { parse, stringify } from 'yaml'
import { encrypt } from "./src/crypto";
import { Article, ArticlesListItem, EncryptedArticle } from "./src/common";

const output_dir = 'dist'
const content_dir = 'content'

async function find_md_file(path: string) {
    let stat = await lstat(path)
    if (stat.isDirectory()) {
        let subfiles = await readdir(path)
        let res = null
        subfiles.forEach(file => {
            let sub = find_md_file(join(path, file))
            if (sub !== null) res = sub
        });
        return res
    } else if (extname(path) == '.md')
        return path
    return null
}

async function parse_article_file(path: string): Promise<Article | EncryptedArticle> {
    let raw = (await readFile(path)).toString('utf-8')
    let meta_split = raw.match(/[^\n]\s*?---\s*?[$\n]/)
    let res = {
        title: 'no title',
        manifest: '',
        pub_time: 0,
        mod_time: 0,
        content: raw,
    }
    if (meta_split !== null && meta_split.index) {
        res.content = raw.substring(meta_split.index + meta_split[0].length)
        let meta = parse(raw.substring(0, meta_split.index + 1))
        res = { ...res, ...meta }
        if (meta.password) {
            let plain = JSON.stringify(res)
            let encrypted = await encrypt(plain, meta.password)
            return encrypted
        }
    }
    return res
}

async function process_article(path: string) {
    let stat = await lstat(path)

    let article_file = null
    if (stat.isDirectory()) {
        article_file = await find_md_file(path)
    } else {
        article_file = path
    }
    if (article_file === null) return null

    let article = await parse_article_file(article_file)
    return article
}

function get_manifest_name(article_path: string) {
    return basename(article_path, '.md') + '.json'
}

async function output_manifest(name: string, obj: any) {
    let manifests_dir = join(output_dir, 'manifests')
    await mkdir(manifests_dir, { recursive: true })
    let output_file = join(manifests_dir, name)
    await Bun.write(output_file, JSON.stringify(obj))
}

let files = await readdir(content_dir)
await Promise.all(files.map(async (filename) => {
    if (filename === 'root') {
        // copy files by bash script
        return null
    }

    if (filename === 'articles') {
        let articles_dir = join(content_dir, filename)
        let article_dirs = await readdir(articles_dir)
        let articles: ArticlesListItem[] = []
        await Promise.all(article_dirs.map(async (adir) => {
            let res = await process_article(join(articles_dir, adir))
            if (res === null) return;
            await output_manifest(get_manifest_name(adir), res)
            if ((<Article>res).title) {
                let art = (<Article>res)
                articles.push({
                    title: art.title,
                    pub_time: art.pub_time,
                    manifest: get_manifest_name(adir)
                })
            }
        }))
        await output_manifest('_articles.json', articles)
    } else {
        let res = await process_article(join(content_dir, filename))
        await output_manifest(get_manifest_name(filename), res)
    }
}))
