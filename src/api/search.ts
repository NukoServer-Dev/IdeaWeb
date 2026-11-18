import type { Hono } from "hono";

function register(app: Hono) {
    app.post('/api/search', async (c) => {
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

        const searchword = body.searchword as string

        if (!searchword) return c.redirect("/")

        return c.redirect("/?s=" + encodeURI(searchword))
    })
}

export default register;