// https://developer.mozilla.org/en-US/docs/Glossary/Base64#converting_arbitrary_binary_data

export async function bytes_to_base64(bytes: BlobPart) {
    return await new Promise((resolve, reject) => {
        const reader = Object.assign(new FileReader(), {
            onload: () => {
                let res = <string>reader.result
                resolve(res.slice(res.indexOf(',') + 1))
            },
            onerror: () => reject(reader.error),
        });
        reader.readAsDataURL(new File([bytes], '', { type: 'application/octet-stream' }));
    });
}

export async function base64_to_bytes(b64: string) {
    const res = await fetch('data:application/octet-stream;base64,' + b64);
    return new Uint8Array(await res.arrayBuffer());
}
