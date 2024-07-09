// Not in use, TBD
const random = (max: number, min: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export function colorCodeToNumber(str: string = "rgb(24, 40, 50)") { // rgb(24, 40, 50) => [24, 50, 50]
    const [r, g, b] = str.match(/\d+/g)!.map(Number);
    return { r, g, b }
};

export function rgbToHSL(str: string = "rgb(24, 40, 50)") {

    let { r, g, b } = colorCodeToNumber(str);

    r /= 255;
    g /= 255;
    b /= 255;

    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;
    return {
        h: 60 * h < 0 ? 60 * h + 360 : 60 * h,
        s: 100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        l: (100 * (2 * l - s)) / 2,
    };
};

// input: h as an angle in [0,360] and s,l in [0,1] - output: r,g,b in [0,1]
export function hslStringToRgb(data: { h: number, s: number, l: number }) {
    let { h, s, l } = data;
    // console.log(data);
    s /= 100
    l /= 100

    let a = s * Math.min(l, 1 - l);
    let f = (n: number, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return [
        Math.round(f(0) * 255),
        Math.round(f(8) * 255),
        Math.round(f(4) * 255)
    ];
}

export function hslObjectToString(data: { h: number, s: number, l: number }): string {
    return `hsl(${data.h.toFixed(0)}, ${data.s.toFixed(0)}%, ${data.l.toFixed(0)}%)`
}

export function monochromeColorList(color: string = "rgb(24, 40, 50)") {

    let colorArr: {
        hsl: string,
        rgb: string,
        rgbArray: number[]
    }[] = [];

    const currentHSL = rgbToHSL(color);

    for (let i = 0; i < 5; i++) {

        currentHSL.l -= random(5, 10)
        if(currentHSL.l <= 0){
            currentHSL.l = 0
        }

        currentHSL.h -= random(-5, 10)
        if(currentHSL.h <= 0){
            currentHSL.h = 0
        }

        const finalHSLStr = hslObjectToString(currentHSL);
        const finalRGBStr = hslStringToRgb(currentHSL);

        // console.log(finalRGBStr)

        colorArr.push({
            hsl: finalHSLStr,
            rgb: `rgb(${finalRGBStr[0]}, ${finalRGBStr[1]}, ${finalRGBStr[2]})`,
            rgbArray: finalRGBStr
        });
    }

    return colorArr
} 