import type { Hono } from "hono";
import { db } from "../db.js";
import { Unauthorized } from "./unauthorized.js";

function AdminPage({ rules, message }: { rules: string; message: string | undefined }) {
    const isDev = import.meta.env.DEV;
    return (
        <html>
            <head>
                <title>管理者ページ</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />

                <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjdiMGYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1saWdodGJ1bGIgcHJldmlldy1pY29uIj48cGF0aCBkPSJNMTUgMTRjLjItMSAuNy0xLjcgMS41LTIuNSAxLS45IDEuNS0yLjIgMS41LTMuNUE2IDYgMCAwIDAgNiA4YzAgMSAuMiAyLjIgMS41IDMuNS43LjcgMS4zIDEuNSAxLjUgMi41Ii8+PHBhdGggZD0iTTkgMThoNiIvPjxwYXRoIGQ9Ik0xMCAyMmg0Ii8+PC9zdmc+" />

                <script dangerouslySetInnerHTML={{ __html: "(()=>{const t=localStorage.getItem('ideaweb-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.backgroundColor=t==='dark'?'#111827':'#e5e7eb'})()" }} />
                {isDev ? <script type="module" src="/src/client.ts"></script> : <><link rel="stylesheet" href="/assets/client.css" /><script type="module" src="/assets/client.js"></script></>}
            </head>
            <body class="p-3 bg-gray-200">
                <h1 class="text-3xl">⚙️ 管理者ページ</h1><br />
                <p class="mb-4"><a href="/" class="bg-gray-700 text-white px-3 py-2 rounded">ホームへ戻る</a></p><br/><br/>
                <form action="/api/admin/posting-rules" method="post" class="border border-blue-400 p-3 rounded max-w-3xl">
                    <h2 class="text-xl font-semibold">📋 投稿ルールの設定</h2>
                    <p class="text-sm mt-1 mb-2">設定したルールはホーム画面と投稿欄に表示されます（5000文字まで）。</p>
                    <textarea name="postingRules" maxLength={5000} rows={8} placeholder="例：個人情報や誹謗中傷を含む投稿はしないでください。" class="p-2 rounded w-full resize-y">{rules}</textarea>
                    <button type="submit" class="bg-blue-500 text-white px-3 py-2 rounded mt-2">ルールを保存</button>
                </form>
                {message ? <p class="border p-3 rounded w-fit mt-4">{message}</p> : ''}
            </body>
        </html>
    );
}

function register(app: Hono) {
    app.get('/admin', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => { get: () => Promise<{ userId: string; role: 'admin' | 'user'; userName: string } | undefined> }
        }).get('session');
        const data = await session.get();
        if (!data || data.role !== 'admin') return c.html(<Unauthorized />, 401);

        const rules = (db.prepare('SELECT value FROM app_settings WHERE key = ?').get('posting_rules') as { value?: string } | undefined)?.value ?? '';
        return c.html(<AdminPage rules={rules} message={c.req.query('message')} />);
    });
}

export default register;
