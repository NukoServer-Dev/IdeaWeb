import type { Hono } from "hono";
import { db } from "../db.js";

type Session = { get: () => Promise<{ userId: string; role: 'admin' | 'user'; userName: string } | undefined> };

function register(app: Hono) {
    app.post('/api/idea-like', async (c) => {
        const session = (c as unknown as { get: (key: 'session') => Session }).get('session');
        const user = await session.get();

        if (!user) return c.redirect('/login', 303);

        const body = await c.req.parseBody();
        const ideaId = Number(body.ideaId);
        const userId = user.userId;

        if (!Number.isSafeInteger(ideaId) || ideaId < 1 || !userId) return c.redirect('/', 303);

        const exists = db.prepare('SELECT 1 FROM ideas WHERE id = ?').get(ideaId);
        if (!exists) return c.redirect('/', 303);

        const liked = db.prepare('SELECT 1 FROM idea_likes WHERE idea_id = ? AND user_id = ?').get(ideaId, userId);

        if (liked) db.prepare('DELETE FROM idea_likes WHERE idea_id = ? AND user_id = ?').run(ideaId, userId);
        else db.prepare('INSERT INTO idea_likes (idea_id, user_id) VALUES (?, ?)').run(ideaId, userId);

        return c.redirect(c.req.header('Referer')?.startsWith(new URL(c.req.url).origin) ? c.req.header('Referer')! : '/', 303);
    });

    app.post('/api/idea-reply', async (c) => {
        const session = (c as unknown as { get: (key: 'session') => Session }).get('session');
        const user = await session.get();

        if (!user) return c.redirect('/login', 303);

        const body = await c.req.parseBody();
        const ideaId = Number(body.ideaId);
        const reply = typeof body.body === 'string' ? body.body.trim() : '';
        const userId = user.userId;

        if (!Number.isSafeInteger(ideaId) || ideaId < 1 || !userId || !reply || reply.length > 2000) return c.redirect('/', 303);

        const exists = db.prepare('SELECT 1 FROM ideas WHERE id = ?').get(ideaId);
        if (!exists) return c.redirect('/', 303);

        db.prepare('INSERT INTO idea_replies (idea_id, user_id, username, body) VALUES (?, ?, ?, ?)').run(ideaId, userId, user.userName, reply);
        return c.redirect(c.req.header('Referer')?.startsWith(new URL(c.req.url).origin) ? c.req.header('Referer')! : '/', 303);
    });
}

export default register;
