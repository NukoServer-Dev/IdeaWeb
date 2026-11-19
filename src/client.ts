import "./style.css";

// Full-page POST/redirect submissions can lose the browser's scroll position.
// Remember it for idea interactions and restore it once the redirected page loads.
const scrollPositionKey = "ideaweb-return-scroll";
const savedScrollPosition = sessionStorage.getItem(scrollPositionKey);
if (savedScrollPosition) {
    sessionStorage.removeItem(scrollPositionKey);
    try {
        const saved = JSON.parse(savedScrollPosition) as { url: string; y: number; savedAt: number };
        if (saved.url === `${location.pathname}${location.search}` && Date.now() - saved.savedAt < 30_000) {
            requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, saved.y)));
        }
    } catch {
        // Ignore invalid or stale scroll state.
    }
}

document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const action = new URL(form.action, location.href);
    if (action.origin !== location.origin || !["/api/idea-like", "/api/idea-reply"].includes(action.pathname)) return;

    sessionStorage.setItem(scrollPositionKey, JSON.stringify({
        url: `${location.pathname}${location.search}`,
        y: window.scrollY,
        savedAt: Date.now(),
    }));
}, true);

const themeStorageKey = "ideaweb-theme";
const savedTheme = localStorage.getItem(themeStorageKey);
const initialTheme = savedTheme === "dark" ? "dark" : "light";
document.documentElement.dataset.theme = initialTheme;

const themeToggle = document.createElement("button");
themeToggle.type = "button";
themeToggle.className = "theme-toggle";
themeToggle.setAttribute("aria-pressed", String(initialTheme === "dark"));

const updateThemeButton = (theme: string) => {
    const isDark = theme === "dark";
    themeToggle.textContent = isDark ? "☀️ ライト" : "🌙 ダーク";
    themeToggle.setAttribute("aria-label", isDark ? "ライトテーマに切り替え" : "ダークテーマに切り替え");
    themeToggle.setAttribute("aria-pressed", String(isDark));
};

updateThemeButton(initialTheme);
document.body.append(themeToggle);

themeToggle.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem(themeStorageKey, nextTheme);
    updateThemeButton(nextTheme);
});

document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement;
    const button = target.closest<HTMLButtonElement>(".delete-button");

    if (!button) return;

    const id = button.dataset.deleteId;
    if (!id) return;

    if (!confirm("本当に削除しますか？")) return;

    button.disabled = true;

    try {
        const resp = await fetch("/api/delete-idea", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: Number(id)
            })
        });

        if (resp.status === 200) {
            location.reload();
            return;
        }

        if (resp.status === 401) {
            alert("権限がありません。");
            return;
        }

        alert("削除に失敗しました。");
    } catch (error) {
        console.error(error);
        alert("通信エラーが発生しました。");
    } finally {
        button.disabled = false;
    }
});

declare const turnstile: {
    render: (selector: string, options: { callback: (token: string) => void }) => unknown;
};

Object.assign(window, { _turnstileCb: () => {
    turnstile.render('.cf-turnstile', {
        callback: function(token: any) {
            const tokenField = document.querySelector<HTMLInputElement>("#turnstile-token");
            const submitButton = document.querySelector<HTMLButtonElement>("button[type='submit']");
            if (tokenField && submitButton) {
                tokenField.value = token;
                submitButton.disabled = false;
            }
        },
    })
} });
