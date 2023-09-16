import { bytes_to_base64, base64_to_bytes } from "./base64_browser"

function encode_utf8(s: string) {
    return (new TextEncoder()).encode(s)
}

function decode_utf8(data: AllowSharedBufferSource) {
    return (new TextDecoder('utf-8')).decode(data)
}

async function get_key_from_password(password: string) {
    password = password.repeat(32 / password.length + 1)
    let raw = encode_utf8(password).subarray(0, 32)
    let key = await crypto.subtle.importKey('raw', raw, 'AES-GCM', true, ['encrypt', 'decrypt'])
    return key
}

export async function encrypt(plaintext: string, password: string) {
    let iv = crypto.getRandomValues(new Uint8Array(96))
    let key = await get_key_from_password(password)
    let data = encode_utf8(plaintext)

    let ciphertext = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        key,
        data
    )

    return {
        data: Buffer.from(ciphertext).toString('base64'),
        iv: Buffer.from(iv).toString('base64'),
    }
}

export async function decrypt(b64data: string, b64iv: string, password: string): Promise<string> {
    let iv = await base64_to_bytes(b64iv)
    let key = await get_key_from_password(password)
    let data = await base64_to_bytes(b64data)

    let plaintext = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data,
    )

    return decode_utf8(plaintext)
}