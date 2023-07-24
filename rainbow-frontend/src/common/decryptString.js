import { Buffer } from 'buffer';

export async function decryptString(b64data, b64iv, password) {
    let data = Buffer.from(b64data, 'base64');
    let iv = Buffer.from(b64iv, 'base64');
    password = password.repeat(32 / password.length + 1);
    let raw = Buffer.from(password, 'utf-8').subarray(0, 32); // 256 bits
    let key = await window.crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["decrypt"]);
    let plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data,
    );
    return Buffer.from(plaintext).toString('utf8');
}