/**
 * General utility helpers
 */

/** Format a Date or ISO string as a relative "time ago" string */
export function timeAgo(date) {
    const ms = Date.now() - new Date(date).getTime();
    const sec = Math.floor(ms / 1000);
    if (sec < 60) return 'just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}d ago`;
    return new Date(date).toLocaleDateString();
}

/** Count words in a string */
export function wordCount(text) {
    return (text ?? '').split(/\s+/).filter(Boolean).length;
}

/** Debounce a function */
export function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

/** Slugify a string to a URL-safe id */
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        .substring(0, 80);
}

/** Truncate text to maxLen characters */
export function truncate(text, maxLen = 100) {
    if (!text || text.length <= maxLen) return text;
    return text.slice(0, maxLen) + '…';
}
