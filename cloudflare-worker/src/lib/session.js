/*
    جایگزین express-session برای Cloudflare Workers.

    Workers نمی‌تونه سشن رو توی حافظه‌ی سرور نگه داره (هر request
    ممکنه روی یک isolate/دیتاسنتر متفاوت اجرا بشه)، برای همین به‌جای
    session store از یک کوکی امضاشده (HMAC-SHA256 با Web Crypto)
    استفاده می‌کنیم: خود کوکی حاوی { admin, exp } هست و با
    SESSION_SECRET امضا میشه تا کسی نتونه دستکاریش کنه.
*/

async function importKey(secret) {

    const enc = new TextEncoder();

    return crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"]
    );
}

function base64UrlEncode(bytes) {

    let binary = "";

    for (const b of bytes) {
        binary += String.fromCharCode(b);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
}

function base64UrlDecode(str) {

    let normalized = str
        .replace(/-/g, "+")
        .replace(/_/g, "/");

    while (normalized.length % 4) {
        normalized += "=";
    }

    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
}

async function signSession(payload, secret, maxAgeSeconds) {

    if (!secret) {
        throw new Error("SESSION_SECRET تنظیم نشده است.");
    }

    const body = {
        ...payload,
        exp: Date.now() + maxAgeSeconds * 1000
    };

    const json = JSON.stringify(body);

    const encodedPayload = base64UrlEncode(
        new TextEncoder().encode(json)
    );

    const key = await importKey(secret);

    const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        new TextEncoder().encode(encodedPayload)
    );

    const signature = base64UrlEncode(
        new Uint8Array(signatureBuffer)
    );

    return `${encodedPayload}.${signature}`;
}

async function verifySession(token, secret) {

    if (!secret || !token || typeof token !== "string" || !token.includes(".")) {
        return null;
    }

    const [encodedPayload, signature] = token.split(".");

    if (!encodedPayload || !signature) {
        return null;
    }

    try {

        const key = await importKey(secret);
        const signatureBytes = base64UrlDecode(signature);

        const valid = await crypto.subtle.verify(
            "HMAC",
            key,
            signatureBytes,
            new TextEncoder().encode(encodedPayload)
        );

        if (!valid) {
            return null;
        }

        const json = new TextDecoder().decode(
            base64UrlDecode(encodedPayload)
        );

        const payload = JSON.parse(json);

        if (!payload.exp || Date.now() > payload.exp) {
            return null;
        }

        return payload;

    } catch (error) {
        return null;
    }
}

module.exports = {
    signSession,
    verifySession
};
