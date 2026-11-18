import "./style.css";

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