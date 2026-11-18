import type { Hono } from "hono";

function register(app: Hono) {
    app.post('/api/login', async (c) => {
        const body = await c.req.parseBody()

        const userName = body.username as string
        const password = body.password as string

        if (!userName || !password) return c.redirect("/login?message=ユーザー名またはパスワードが間違っています。")

        if (userName != process.env.ADMIN_USERNAME) {
            return c.redirect("/login?message=ユーザー名またはパスワードが間違っています。")
        }

        if (password != process.env.ADMIN_PASSWORD) {
            return c.redirect("/login?message=ユーザー名またはパスワードが間違っています。")
        }

        const session = (c as unknown as {
            get: (key: 'session') => {
                update: (data: { userId: string; role: 'admin'; userName: string; }) => Promise<void>
            }
        }).get('session')
        
        await session.update({
            userId: process.env.ADMIN_USERNAME,
            role: 'admin',
            userName: process.env.ADMIN_USERNAME
        })

        return c.redirect("/")
    })
}

export default register;