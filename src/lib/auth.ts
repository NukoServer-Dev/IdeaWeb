import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { db } from '../db.js';

const PASSWORD_BYTES = 64;
export function hashPassword(password: string) {
    const salt = randomBytes(16);
    const hash = scryptSync(password, salt, PASSWORD_BYTES);
    return `scrypt:${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, encoded: string) {
    const [, saltHex, hashHex] = encoded.split(':');
    if (!saltHex || !hashHex || !/^[a-f0-9]{32}$/.test(saltHex) || !/^[a-f0-9]{128}$/.test(hashHex)) {
        scryptSync(password, Buffer.alloc(16), PASSWORD_BYTES);
        return false;
    }
    const expected = Buffer.from(hashHex, 'hex');
    return timingSafeEqual(scryptSync(password, Buffer.from(saltHex, 'hex'), PASSWORD_BYTES), expected);
}

export function consumeAuthAttempt(ip: string, action: string, limit = 10) {
    const now = Math.floor(Date.now() / 1000);
    const key = createHash('sha256').update(`${action}:${ip}`).digest('hex');
    db.prepare('DELETE FROM auth_attempts WHERE attempted_at < ?').run(now - 900);
    const count = db.prepare('SELECT COUNT(*) AS count FROM auth_attempts WHERE attempt_key = ? AND attempted_at >= ?').get(key, now - 900)?.count as number;
    db.prepare('INSERT INTO auth_attempts (attempt_key, attempted_at) VALUES (?, ?)').run(key, now);
    return Number(count) < limit;
}

export async function verifyTurnstile(token: unknown, ip: string) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return process.env.NODE_ENV !== 'production';
    if (typeof token !== 'string' || token.length > 2048) return false;

    const form = new FormData();
    form.set('secret', secret);
    form.set('response', token);
    if (ip) form.set('remoteip', ip);
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST', body: form, signal: AbortSignal.timeout(5000),
        });
        if (!response.ok) return false;
        const result = await response.json() as { success?: boolean; hostname?: string };
        return result.success === true && (!process.env.TURNSTILE_HOSTNAME || result.hostname === process.env.TURNSTILE_HOSTNAME);
    } catch {
        return false;
    }
}
