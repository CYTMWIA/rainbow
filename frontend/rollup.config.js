import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import * as fs from 'node:fs/promises';
import * as path from 'node:path'

// https://stackoverflow.com/a/45130990
async function* getFiles(dir) {
    const dirents = await fs.readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

let rollupList = [];
for await (const file of getFiles('src-wasm')) {
    if (path.extname(file) === '.js' && !path.basename(file).startsWith('__')) {
        let outputPath = path.join(path.dirname(file), `__${path.basename(file)}`);
        rollupList.push({
            input: file,
            output: {
                file: outputPath,
                format: 'iife'
            },
            plugins: [nodeResolve(), commonjs()]
        })
    }
}

export default rollupList;
