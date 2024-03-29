import axios, { AxiosResponse } from "axios";
import React from "react";
import { createRoot } from "react-dom/client";
import { decrypt } from "./crypto";

export interface Query {
    manifest: string,
    password?: string,
    [key: string]: any
}

export interface Article {
    fs_path: string,

    title: string,
    pub_time?: number,
    mod_time?: number,

    content: string,

    encrypt?: {
        password: string,
        data: string,
        iv: string,
    }
};

export namespace Manifest {
    export interface Article {
        title: string,
        pub_time?: number,
        mod_time?: number,
        content: string,
    };

    export interface EncryptedManifest {
        data: string,
        iv: string,
    };

    export interface ArticlesListItem {
        manifest: string,
        title: string,
        pub_time?: number,
    }
}

export function parse_query(default_manifest: string): Query {
    let qstr = document.location.search;
    let query: Query = {
        manifest: default_manifest,
        password: undefined
    }
    let state = 'NONE', begin = 0, key = ''
    for (let i = 0; i < qstr.length; i += 1) {
        if (state === 'NONE') {
            if ('?&'.indexOf(qstr[i]) !== -1) {
            } else {
                begin = i;
                state = 'KEY';
            }
        } else if (state === 'KEY') {
            if (i + 1 === qstr.length) {
                query.manifest = qstr.substring(begin, qstr.length);
                state = 'NONE';
            }
            else if (qstr[i] === '&') {
                query.manifest = qstr.substring(begin, i);
                state = 'NONE';
            } else if (qstr[i] == '=') {
                key = qstr.substring(begin, i);
                begin = i + 1;
                state = 'VALUE';
            }
        } else if (state === 'VALUE') {
            if (i + 1 === qstr.length) {
                query[key] = qstr.substring(begin, qstr.length);
                state = 'NONE';
            } else if (qstr[i] === '&') {
                query[key] = qstr.substring(begin, i);
                state = 'NONE';
            }
        }
    }
    return query;
}

export function format_time(ts: number) {
    // return moment.unix(ts).format('YYYY/MM/DD hh:mm:ss')

    // Using `Date` instead of `moment` due to large output code size
    let d = (new Date(ts))
    let YYYY = d.getFullYear().toString().padStart(4, '0')
    let MM = (d.getMonth() + 1).toString().padStart(2, '0')
    let DD = d.getDate().toString().padStart(2, '0')
    let hh = d.getHours().toString().padStart(2, '0')
    let mm = d.getMinutes().toString().padStart(2, '0')
    let ss = d.getSeconds().toString().padStart(2, '0')
    return `${YYYY}/${MM}/${DD} ${hh}:${mm}:${ss}`
}

export function random_background_color() {
    let h = (Math.random() * 360).toString() + 'deg'
    let s = (Math.random() * 100) + '%'
    let l = (80 + Math.random() * 15) + '%'
    document.body.style.backgroundColor = `hsl(${h}, ${s}, ${l})`
}

export function mount_app(node: React.ReactNode) {
    const mount_point = document.getElementById('rainbow-root')
    if (mount_point !== null) {
        const root = createRoot(mount_point)
        root.render(node)
    }
    else console.log("document.getElementById('rainbow-root') failed!")
}

export function add_script_node(src: string, opt?: { async_?: boolean, defer?: boolean }) {
    let script = document.createElement('script');
    script.setAttribute('src', src);
    script.async = opt ? (opt.async_ ? opt.async_ : false) : (false)
    script.defer = opt ? (opt.defer ? opt.defer : false) : (false)
    document.head.appendChild(script);
}

export async function fetch_manifest(name: string, password?: string) {
    let response: AxiosResponse<any, any>
    try {
        response = await axios.get(`manifests/${name}`)
        if (response.status !== 200)
            throw Error('response.status !== 200')
    } catch (error) {
        alert(`${name} 获取失败`)
        return
    }

    let resp_data = response.data
    if ((resp_data as Manifest.EncryptedManifest).iv) {
        let ea = resp_data as Manifest.EncryptedManifest
        if (password) {
            let json_str = await decrypt(ea.data, ea.iv, password)
            return JSON.parse(json_str)
        }
    } else {
        return response.data
    }
}
