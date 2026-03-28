export function parseLRC(lrc: string) {
    return lrc.split("\n").map(line => {
        const match = line.match(/\[(\d+):(\d+)(?:\.(\d+))?\](.*)/);
        if (!match) return null;

        const min = parseInt(match[1]);
        const sec = parseInt(match[2]);
        const ms = match[3] ? parseInt(match[3]) : 0;

        return {
            time: min * 60 + sec + ms / 100,
            text: match[4].trim()
        };
    }).filter(Boolean);
}