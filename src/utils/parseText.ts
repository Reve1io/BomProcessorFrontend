export function parseText(text: string, delimiter: string) {
    const rows = text
        .trim()
        .split("\n")
        .map(line => {
            switch (delimiter) {
                case "tab":
                    return line.split("\t");

                case "space":
                    return line.trim().split(/\s+/);

                case "semicolon":
                    return line.split(";");

                case "comma":
                    return line.split(",");

                default:
                    return [line];
            }
        });

    return rows.filter(r => r.length > 0);
}
