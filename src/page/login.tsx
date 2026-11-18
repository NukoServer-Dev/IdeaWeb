import type { Hono } from "hono";

const isDev = import.meta.env.DEV;

function App({message}: {message: string | undefined}) {
    return (
        <html>
            <header>
                <title>ログイン</title>
                {isDev ? (
                    <script type="module" src="/src/client.ts"></script>
                ) : (
                    <link rel="stylesheet" href="/assets/client.css" />
                )}
            </header>
            
            <body class="p-3 bg-gray-200">
                <h1 class="text-3xl">🚪ログイン</h1><br/>

                <form action="/api/login" method="post" class="border p-3 rounded">
                    <input name="username" placeholder="ユーザー名" class="p-1 text-white bg-gray-800 mb-3 rounded" /><br/>
                    <input name="password" placeholder="パスワード" class="p-1 text-white bg-gray-800 mb-3 rounded" type="password" /><br/>
                    <button type="submit" class="bg-blue-500 text-white p-3 rounded">ログイン</button>
                </form>{message ? <br/> : ""}

                {message ? <div class="border p-3 rounded">{message}<br/></div> : ''}<br/>
            </body>
        </html>
    )
}

function register(app: Hono) {
    app.get('/login', (c) => {
        const message = c.req.query("message")

        return c.html(<App message={message} />);
    })
}

export default register;