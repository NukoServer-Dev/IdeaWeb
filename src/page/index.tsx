import type { Hono } from "hono";
import { getIdeas } from "../lib/idea.js";
import type { Idea } from "../types/idea.js";
import { Unauthorized } from "./unauthorized.js";

const isDev = import.meta.env.DEV;

function App(
    {ideas, now_page, all_page, message, searchWord, isAdmin, username}: 
    {ideas: Idea[], now_page: number, all_page: number, message: string | undefined, searchWord: string, isAdmin: boolean, isUser: boolean, username: string}
) {
    return (
        <html>
            <head>
                <title>IdeaWeb</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>

                <meta property="og:url" content="https://idea.nuko-server.xyz/" />
                <meta property="og:title" content="IdeaWeb" />
                <meta property="og:description" content="みんなとアイディアを共有しよう。" />

                <link rel="icon" type="image/svg+xml" href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZjdiMGYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1saWdodGJ1bGIgcHJldmlldy1pY29uIj48cGF0aCBkPSJNMTUgMTRjLjItMSAuNy0xLjcgMS41LTIuNSAxLS45IDEuNS0yLjIgMS41LTMuNUE2IDYgMCAwIDAgNiA4YzAgMSAuMiAyLjIgMS41IDMuNS43LjcgMS4zIDEuNSAxLjUgMi41Ii8+PHBhdGggZD0iTTkgMThoNiIvPjxwYXRoIGQ9Ik0xMCAyMmg0Ii8+PC9zdmc+" />

                <script dangerouslySetInnerHTML={{ __html: "(()=>{const t=localStorage.getItem('ideaweb-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.backgroundColor=t==='dark'?'#111827':'#e5e7eb'})()" }} />
                {isDev ? (
                    <script type="module" src="/src/client.ts"></script>
                ) : (
                    <><link rel="stylesheet" href="/assets/client.css" /><script type="module" src="/assets/client.js"></script></>
                )}
            </head>
            
            <body class="p-3 bg-gray-200">
                <h1 class="text-3xl">🏠ホーム</h1><br/>

                <p>
                    あなたは{isAdmin ? '管理者' : 'ユーザー'}です。
                </p><br/>

                <form action="/api/logout" method="post"><button type="submit" class="bg-gray-700 text-white p-2 rounded">ログアウト</button></form><br/>

                <form action="/api/add-idea" method="post" class="border p-3 rounded">
                    <h1 class="text-2xl p-0">✒️アイディアを投稿</h1><br/>

                    投稿者名: <input name="author" placeholder="投稿者名" class="p-1 text-white bg-gray-800 mb-3 rounded" value={username} /><br/>
                    アイディア名: <input name="idea" placeholder="アイディア名" class="p-1 text-white bg-gray-800 mb-3 rounded" /><br/>
                    説明: <br/>
                    <textarea name="description" placeholder="説明" class="p-1 text-white bg-gray-800 mb-3 rounded w-full resize-y"></textarea><br/>
                    <button type="submit" class="bg-blue-500 text-white p-3 rounded">追加する</button>
                </form>{message ? <br/> : ""}

                {message ? <div class="border p-3 rounded">{message}<br/></div> : ''}<br/>

                <h1 class="text-2xl">集まったアイディア一覧</h1><br/>

                <form action="/api/search" method="post">
                    <input name="searchword" placeholder="検索ワードを入力" class="p-1 text-white bg-gray-800 mb-3 rounded mr-2" value={searchWord} />
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded">検索</button>
                </form>

                {ideas.length != 0 ? ideas.map((idea) => <div class="border p-3 rounded mt-3 flex justify-between items-center">
                    <div>
                        <h3 class="text-xl">💡{idea.Idea} by {idea.Author}</h3>
                        <p>{idea.Description}</p>
                        <span class="text-xs">🗓️追加日: {idea.CreatedAt}</span>
                        <div class="mt-3 flex items-center gap-3">
                            <form action="/api/idea-like" method="post">
                                <input type="hidden" name="ideaId" value={idea.ID} />
                                <button type="submit" class="border px-3 py-1 rounded" aria-pressed={idea.LikedByMe ? "true" : "false"}>{idea.LikedByMe ? "♥ いいね済み" : "♡ いいね"} ({idea.LikeCount})</button>
                            </form>
                        </div>
                        <div class="mt-3 border-t pt-3">
                            <h4 class="font-semibold">返信 ({idea.Replies.length})</h4>
                            {idea.Replies.map((reply) => <div class="mt-2"><strong>{reply.Author}</strong> <span class="text-xs">{reply.CreatedAt}</span><p class="whitespace-pre-wrap">{reply.Body}</p></div>)}
                            <form action="/api/idea-reply" method="post" class="mt-3">
                                <input type="hidden" name="ideaId" value={idea.ID} />
                                <textarea name="body" maxLength={2000} required placeholder="返信を書く" class="p-2 rounded w-full resize-y" rows={2}></textarea>
                                <button type="submit" class="bg-blue-500 text-white px-3 py-2 rounded mt-2">返信する</button>
                            </form>
                        </div>
                    </div>
                    {isAdmin ? <div>
                        <button
                            type="button"
                            data-delete-id={idea.ID}
                            class="delete-button bg-red-500 text-white p-3 rounded"
                        >
                            削除
                        </button>
                    </div> : ""}
                </div>) : "まだ投稿がありません。"}<br/><br/>

                <div class="flex gap-2">
                    {all_page != 1 ? (all_page > now_page ? "" : <a href={`?p=${now_page - 1}`} class="bg-blue-500 text-white p-3 rounded">前のページ</a>) : ""}
                    <span class="p-3">{now_page} / {all_page}</span>
                    {all_page <= now_page ? "" : <a href={`?p=${now_page + 1}`} class="bg-blue-500 text-white p-3 rounded">次のページ</a>}
                </div>
            </body>
        </html>
    )
}

function register(app: Hono) {
    app.get('/', async (c) => {
        const session = (c as unknown as {
            get: (key: 'session') => {
                get: () => Promise<{ userId: string; role: 'admin' | 'user'; userName: string; } | undefined>
                update: (data: { userId: string; role: 'admin' | 'user'; userName: string; }) => Promise<void>
            }
        }).get('session')
        const data = await session.get()
        if (!data || Object.keys(data).length === 0) {
            return c.html(<Unauthorized />, 401)
        }

        const message = c.req.query("message")

        const page = c.req.query('p')
        let page_num = Number(page);

        if (Number.isNaN(page_num)) {
            page_num = 1;
        }

        const searchWord = c.req.query("s") ?? ""

        const ideas = getIdeas(page_num, searchWord, data.userId)

        return c.html(<App ideas={ideas.data} all_page={ideas.pagination.totalPages} now_page={page_num} message={message} searchWord={searchWord} username={data.userName} isAdmin={data.role == "admin"} isUser={data.role == "user"} />);
    })
}

export default register;
