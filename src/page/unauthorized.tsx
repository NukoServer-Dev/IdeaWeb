const isDev = import.meta.env.DEV;

export function Unauthorized() {
    return (
        <html>
            <head>
                <title>IdeaWeb</title>
                <script dangerouslySetInnerHTML={{ __html: "(()=>{const t=localStorage.getItem('ideaweb-theme')==='dark'?'dark':'light';document.documentElement.dataset.theme=t;document.documentElement.style.backgroundColor=t==='dark'?'#111827':'#e5e7eb'})()" }} />
                {isDev ? (
                    <script type="module" src="/src/client.ts"></script>
                ) : (
                    <><link rel="stylesheet" href="/assets/client.css" /><script type="module" src="/assets/client.js"></script></>
                )}
            </head>
            
            <body class="p-3 bg-gray-200">
                <h1 class="text-3xl">💡IdeaWebへようこそ！</h1><br/>

                <p>
                    ログインが必要です。<br/>
                    ログインを行ってください。<br/><br/>
                    <a href="/login" class="bg-blue-500 text-white p-3 rounded">ログイン</a>
                </p>
            </body>
        </html>
    )
}
