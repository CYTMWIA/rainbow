function replace_all_slash(s: string) {
    return s.replaceAll('\\', '/')
}

export function join(...paths: string[]) {
    for (let i = 0; i < paths.length; i++) {
        paths[i] = replace_all_slash(paths[i])
        if (paths[i].endsWith('/'))
            paths[i] = paths[i].substring(0, paths[i].length - 1)
    }
    let res = paths[0]
    for (let i = 1; i < paths.length; i++) {
        if (paths[i].startsWith('/'))
            res += paths[i]
        else
            res += '/' + paths[i]
    }
    return res
}

export function basename(path_: string) {
    let path = replace_all_slash(path_)
    let slash_index = path.lastIndexOf('/')
    if (slash_index < 0)
        return path
    else
        return path.substring(slash_index + 1)
}

export function dirname(path_: string) {
    let path = replace_all_slash(path_)
    let slash_index = path.lastIndexOf('/')
    if (slash_index < 0)
        return path
    else
        return path.substring(0, slash_index)
}

export default {
    basename,
    dirname,
    join
}
