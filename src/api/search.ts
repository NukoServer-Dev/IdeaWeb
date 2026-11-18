import type { Hono } from "hono";

function register(app: Hono) {
    app.post('/api/search', async (c) => {
        const body = await c.req.parseBody()

        const searchword = body.searchword as string

        if (!searchword) return c.redirect("/")

        return c.redirect("/?s=" + encodeURI(searchword))
    })
}

export default register;