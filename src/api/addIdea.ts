import type { Hono } from "hono";
import { addIdea } from "../lib/idea.js";

function register(app: Hono) {
    app.post('/api/add-idea', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => {
                get: () => Promise<{ userId: string; role: 'admin'; userName: string; } | undefined>
                update: (data: { userId: string; role: 'admin'; userName: string; }) => Promise<void>
            }
        }).get('session')
        const data = await session.get()
        if (!data || Object.keys(data).length === 0) {
            return c.redirect("/");
        }

        const body = await c.req.parseBody()

        const author = body.author as string
        const idea = body.idea as string
        const description = body.description as string

        if (!author || !idea || !description) return c.redirect("/?message=必要な項目が入力されていません。")

        addIdea(author, idea, description)

        return c.redirect("/?message=追加しました。")
    })
}

export default register;