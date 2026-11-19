import type { Hono } from "hono";
import { db } from "../db.js";

function register(app: Hono) {
    app.post('/api/admin/posting-rules', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => {
                get: () => Promise<{ userId: string; role: 'admin' | 'user'; userName: string; } | undefined>
            }
        }).get('session');
        const data = await session.get();

        if (!data || data.role !== 'admin') {
            return c.redirect('/login', 303);
        }

        const body = await c.req.parseBody();
        const rules = body.postingRules;
        if (typeof rules !== 'string' || rules.length > 5000) {
            return c.redirect('/admin?message=ルールは5000文字以内で入力してください。', 303);
        }

        db.prepare(`
            INSERT INTO app_settings (key, value) VALUES ('posting_rules', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `).run(rules.trim());

        return c.redirect('/admin?message=書き込みルールを保存しました。', 303);
    });
}

export default register;
