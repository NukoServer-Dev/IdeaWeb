import type { Hono } from "hono";
import { addIdea } from "../lib/idea.js";

function register(app: Hono) {
    app.post('/api/add-idea', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => {
                get: () => Promise<{ userId: string; role: 'admin' | 'user'; userName: string; } | undefined>
            }
        }).get('session')
        const data = await session.get()
        if (!data || (data.role !== 'admin' && data.role !== 'user')) {
            return c.redirect("/login", 303);
        }

        const body = await c.req.parseBody()

        const author = body.author as string
        const idea = body.idea as string
        const description = body.description as string

        if (!author || !idea || !description || author.length > 80 || idea.length > 200 || description.length > 5000) return c.redirect("/?message=入力内容を確認してください。", 303)

        addIdea(data.role === 'admin' ? author : data.userName, idea, description)

        return c.redirect("/?message=追加しました。")
    })
}

export default register;
