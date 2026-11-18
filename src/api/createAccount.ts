import type { Hono } from 'hono';
import { db } from '../db.js';
import { consumeAuthAttempt, hashPassword, verifyTurnstile } from '../lib/auth.js';
import type { SessionData } from '../types/session.js';

function register(app: Hono) {
    app.post('/api/create-account', async (c) => {

        const body = await c.req.parseBody();
        const username = typeof body.username === 'string' ? body.username.trim() : '';
        const password = typeof body.password === 'string' ? body.password : '';
        
        const ip = c.req.header('CF-Connecting-IP') ?? 'unknown';

        if (!consumeAuthAttempt(ip, 'register', 5)) return c.redirect('/create-account?message=試行回数が多すぎます。しばらくしてから再度お試しください。', 303);
        if (!/^[\p{L}\p{N}_-]{3,32}$/u.test(username) || password.length < 12 || password.length > 256) {
            return c.redirect('/create-account?message=ユーザー名は3〜32文字、パスワードは12文字以上で入力してください。', 303);
        }
        if (!await verifyTurnstile(body.turnstileToken, ip)) {
            return c.redirect('/create-account?message=本人確認に失敗しました。もう一度お試しください。', 303);
        }

        try {
            const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hashPassword(password));
            const session = c.get('session' as never) as unknown as { update: (data: SessionData) => Promise<void> };
            await session.update({ userId: String(result.lastInsertRowid), role: 'user', userName: username });
        } catch (error) {
            if ((error as { code?: string }).code === 'SQLITE_CONSTRAINT_UNIQUE') {
                return c.redirect('/create-account?message=そのユーザー名は既に使用されています。', 303);
            }
            throw error;
        }
        return c.redirect('/', 303);
    });
}

export default register;
