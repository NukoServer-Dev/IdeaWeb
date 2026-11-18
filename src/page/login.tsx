import type { Hono } from "hono";

const isDev = import.meta.env.DEV;

function App({message}: {message: string | undefined}) {
    return (
        <html>
            <head>
                <title>ログイン</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>

                <meta property="og:url" content="https://idea.nuko-server.xyz/" />
                <meta property="og:title" content="IdeaWebログイン" />
                <meta property="og:description" content="ログインをして共有を始めましょう" />

                <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjdiMGYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1saWdodGJ1bGIgcHJldmlldy1pY29uIj48cGF0aCBkPSJNMTUgMTRjLjItMSAuNy0xLjcgMS41LTIuNSAxLS45IDEuNS0yLjIgMS41LTMuNUE2IDYgMCAwIDAgNiA4YzAgMSAuMiAyLjIgMS41IDMuNS43LjcgMS4zIDEuNSAxLjUgMi41Ii8+PHBhdGggZD0iTTkgMThoNiIvPjxwYXRoIGQ9Ik0xMCAyMmg0Ii8+PC9zdmc+" />

                <script dangerouslySetInnerHTML={{ __html: "(()=>{const t=localStorage.getItem('ideaweb-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.backgroundColor=t==='dark'?'#111827':'#e5e7eb'})()" }} />
                {isDev ? (
                    <script type="module" src="/src/client.ts"></script>
                ) : (
                    <><link rel="stylesheet" href="/assets/client.css" /><script type="module" src="/assets/client.js"></script></>
                )}
            </head>
            
            <body class="p-3 bg-gray-200">
                <h1 class="text-3xl">🚪ログイン</h1><br/>

                <form action="/api/login" method="post" class="border p-3 rounded">
                    <input name="username" placeholder="ユーザー名" class="p-1 text-white bg-gray-800 mb-3 rounded" /><br/>
                    <input name="password" placeholder="パスワード" class="p-1 text-white bg-gray-800 mb-3 rounded" type="password" /><br/>
                    <div class="flex gap-3">
                        <button type="submit" class="bg-gray-500 text-white p-3 rounded">ログイン</button>
                        <a href="/create-account" class="bg-blue-500 text-white p-3 rounded">アカウントを作成</a>
                    </div>
                </form>

                {message ? <div><br/><div class="border p-3 rounded">{message}<br/></div></div> : ''}

                
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
