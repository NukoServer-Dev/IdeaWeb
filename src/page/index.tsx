import type { Hono } from "hono";
import { getIdeas } from "../lib/idea.js";
import type { Idea } from "../types/idea.js";

function App({ideas, now_page, all_page, message, searchWord}: {ideas: Idea[], now_page: number, all_page: number, message: string | undefined, searchWord: string}) {
    return (
        <html>
            <header>
                <title>IdeaWeb</title>
                <link rel="stylesheet" href="/src/style.css"></link>
            </header>
            
            <body class="p-3 bg-gray-200">
                <h1 class="text-3xl">💡IdeaWebへようこそ！</h1><br/>

                <p>
                    匿名でアイディアを投稿できます。<br/>
                    基本的に削除はできないため、<br/>
                    倫理観のある投稿をしましょう。
                </p><br/>

                <form action="/api/add-idea" method="post" class="border p-3 rounded">
                    <h1 class="text-2xl p-0">✒️アイディアを投稿</h1><br/>

                    <input name="author" placeholder="投稿者名" class="p-1 text-white bg-gray-800 mb-3 rounded" /><br/>
                    <input name="idea" placeholder="アイディア名" class="p-1 text-white bg-gray-800 mb-3 rounded" /><br/>
                    <textarea name="description" placeholder="説明" class="p-1 text-white bg-gray-800 mb-3 rounded"></textarea><br/>
                    <button type="submit" class="bg-blue-500 text-white p-3 rounded">追加する</button>
                </form>{message ? <br/> : ""}

                {message ? <div class="border p-3 rounded">{message}<br/></div> : ''}<br/>

                <h1 class="text-2xl">集まったアイディア一覧</h1><br/>

                <form action="/api/search" method="post">
                    <input name="searchword" placeholder="検索ワードを入力" class="p-1 text-white bg-gray-800 mb-3 rounded mr-2" value={searchWord} />
                    <button type="submit" class="bg-blue-500 text-white p-2 rounded">検索</button>
                </form>

                {ideas.length != 0 ? ideas.map((idea) => <div class="border p-3 rounded mt-3">
                    <h3 class="text-xl">💡{idea.Idea} by {idea.Author}</h3>
                    <p>{idea.Description}</p>
                    <span class="text-xs">🗓️追加日: {idea.CreatedAt}</span>
                </div>) : "まだ投稿がありません。"}<br/><br/>

                <div class="flex gap-2">
                    {all_page != 0 ? (all_page > now_page ? "" : <a href={`?p=${now_page - 1}`} class="bg-blue-500 text-white p-3 rounded">前のページ</a>) : ""}
                    <span class="p-3">{now_page} / {all_page}</span>
                    {all_page <= now_page ? "" : <a href={`?p=${now_page + 1}`} class="bg-blue-500 text-white p-3 rounded">次のページ</a>}
                </div>
            </body>
        </html>
    )
}

function register(app: Hono) {
    app.get('/', (c) => {
        const message = c.req.query("message")

        const page = c.req.query('p')
        let page_num = Number(page);

        if (Number.isNaN(page_num)) {
            page_num = 1;
        }

        const searchWord = c.req.query("s") ?? ""

        const ideas = getIdeas(page_num, searchWord)

        return c.html(<App ideas={ideas.data} all_page={ideas.pagination.totalPages} now_page={page_num} message={message} searchWord={searchWord} />);
    })
}

export default register;