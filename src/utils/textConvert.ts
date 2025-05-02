/** Upper */

export function capitalizeFirstLetter(val: string) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

export function capitalizeFirstLetterSentences(val: string) {
    return val.split(" ")
        .map( v => v.split("\n").map(k => capitalizeFirstLetter(k)).join("\n") )
        .join(" ")
}

/** Lower */
export function lowerFirstLetter(val: string) {
    return String(val).charAt(0).toLowerCase() + String(val).slice(1);
}

export function lowerFirstLetterSentences(val: string) {
    return val.split(" ")
        .map( v => v.split("\n").map(k => lowerFirstLetter(k)).join("\n") )
        .join(" ")
}

/** Chaos */
export function chaosLetter(val: string) {
    return val.split("")
    .map( s => Math.random() >= 0.5 
        ? s.toUpperCase()
        : s.toLowerCase()
    ).join("")
}