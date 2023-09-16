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
