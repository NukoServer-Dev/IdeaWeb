import type { Hono } from "hono";

function register(app: Hono) {
    app.post('/api/logout', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => {
                delete: () => Promise<void>
            }
        }).get('session')
        
        await session.delete()

        return c.redirect("/")
    })
}

export default register;
