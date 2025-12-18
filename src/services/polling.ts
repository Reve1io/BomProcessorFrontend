export async function pollStatus<T>(
    url: string,
    interval = 2000,
    timeout = 5 * 60 * 1000
): Promise<T> {
    const start = Date.now();

    while (true) {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Status HTTP ${res.status}`);
        }

        const json = await res.json();

        if (json.status === "COMPLETED") {
            return json;
        }

        if (json.status === "FAILED") {
            throw new Error(json.error || "Задача завершилась с ошибкой");
        }

        if (json.status === "NOT_FOUND") {
            throw new Error("Задача не найдена");
        }

        if (Date.now() - start > timeout) {
            throw new Error("Превышено время ожидания обработки");
        }

        await new Promise(r => setTimeout(r, interval));
    }
}
