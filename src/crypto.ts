async function get_key_from_password(password: string) {
    password = password.repeat(32 / password.length + 1)
    let raw = Buffer.from(password, 'utf-8').subarray(0, 32)
    let key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt'])
    return key
}

export async function encrypt(plaintext: string, password: string) {
    let iv = crypto.getRandomValues(new Uint8Array(96))
    let key = await get_key_from_password(password)
    let data = Buffer.from(plaintext, 'utf-8')

    let ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    );

    return {
        data: Buffer.from(ciphertext).toString('base64'),
        iv: Buffer.from(iv).toString('base64'),
    }
}

export async function decrypt(b64data: string, b64iv: string, password: string): Promise<string> {
    let iv = Buffer.from(b64iv, 'base64')
    let key = await get_key_from_password(password)
    let data = Buffer.from(b64data, 'base64')

    let plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data,
    );

    return Buffer.from(plaintext).toString('utf8');
}