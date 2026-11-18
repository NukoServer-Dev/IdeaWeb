import type { Hono } from 'hono';
import { db } from '../db.js';
import { consumeAuthAttempt, verifyPassword } from '../lib/auth.js';
import type { SessionData } from '../types/session.js';

function register(app: Hono) {
    app.post('/api/login', async (c) => {
        const body = await c.req.parseBody();
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';
        const session = c.get('session' as never) as unknown as { update: (data: SessionData) => Promise<void> };

        if (!consumeAuthAttempt(ip, 'login', 10)) return c.redirect('/login?message=試行回数が多すぎます。しばらくしてから再度お試しください。', 303);
        if (!username || !password || username.length > 32 || password.length > 256) return c.redirect('/login?message=ユーザー名またはパスワードが間違っています。', 303);

        if (username.toLowerCase() === (process.env.ADMIN_USERNAME ?? '').toLowerCase() && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
            await session.update({ userId: 'admin', role: 'admin', userName: process.env.ADMIN_USERNAME });
            return c.redirect('/', 303);
        }

        const user = db.prepare('SELECT id, username, password_hash FROM users WHERE username = ? COLLATE NOCASE').get(username) as { id: number; username: string; password_hash: string } | undefined;
        const valid = user ? verifyPassword(password, user.password_hash) : (verifyPassword(password, 'invalid') && false);
        if (!user || !valid) return c.redirect('/login?message=ユーザー名またはパスワードが間違っています。', 303);

        await session.update({ userId: String(user.id), role: 'user', userName: user.username });
        return c.redirect('/', 303);
    });
}

export default register;
