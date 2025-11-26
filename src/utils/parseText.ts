export function parseText(text: string): any[][] {
    return text
        .trim()
        .split(/\r?\n/)
        .filter(line => line.trim().length > 0)
        .map(line =>
            line
                .split(/\t|;/)
                .map(cell => cell.trim())
        );
}
