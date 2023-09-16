export interface Query {
    manifest: string,
    password: string | null,
    [key: string]: any
}

export interface Article {
    title: string,
    pub_time: number,
    mod_time: number,
    content: string,
};

export interface EncryptedArticle {
    data: string,
    iv: string,
};

export function parse_query(default_manifest: string): Query {
    let qstr = document.location.search;
    let query: Query = {
        manifest: default_manifest,
        password: null
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
    let d = (new Date(ts * 1000))
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