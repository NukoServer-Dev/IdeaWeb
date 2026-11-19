import type { Hono } from 'hono';
import { db } from '../db.js';

function register(app: Hono) {
    app.post('/api/delete-account', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => {
                get: () => Promise<{ userId: string; role: 'admin' | 'user'; userName: string } | undefined>;
                delete: () => Promise<void>;
            }
        }).get('session');
        const user = await session.get();

        // The account identity comes only from the authenticated session. The admin
        // account is not stored in the users table and must never be deleted here.
        if (!user || user.role !== 'user' || !/^\d+$/.test(user.userId)) {
            return c.redirect('/', 303);
        }

        db.prepare('DELETE FROM users WHERE id = ?').run(Number(user.userId));
        await session.delete();
        return c.redirect('/login', 303);
    });
}

export default register;
