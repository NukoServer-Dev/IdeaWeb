import type { Hono } from "hono";
import { addIdea, deleteIdea } from "../lib/idea.js";

function register(app: Hono) {
    app.post('/api/delete-idea', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => {
                get: () => Promise<{ userId: string; role: 'admin'; userName: string; } | undefined>
                update: (data: { userId: string; role: 'admin'; userName: string; }) => Promise<void>
            }
        }).get('session')
        const data = await session.get()
        if (!data || Object.keys(data).length === 0) {
            return c.json({
                "status": "error"
            }, 401)
        }

        if (data.role != "admin") {
            return c.json({
                "status": "error"
            }, 401)
        }

        const json = await c.req.json()

        const id = json.id;

        if (!id) return c.json({
            "status": "error"
        }, 400)

        deleteIdea(id)

        return c.json({
            "status": "ok"
        })
    })
}

export default register;