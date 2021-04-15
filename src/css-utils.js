import CSS_COLOR_NAMES from "./html-colors";

function getColor(border) {
    if (!border) return false
    border = border.split(' ')
    for (let i in border) {
        i = Number(i)
        const val = border[i]
        // color is a hex code
        if (val.toLowerCase().match(/#([0-9a-f]{3}){1,2}/)) return val
        // color is a function (rgb, rgba, hsl, hsla)
        if (val.startsWith('rgb') || val.startsWith('hsl')) {
            if (val.endsWith(')')) return val
            let color = val;
            for (let j = 1; !border[i + j - 1].endsWith(')'); j++) {
                color += border[i + j]
            }
            return color
        }
        // color is a html color name
        if (
            CSS_COLOR_NAMES.map(color => color.toLowerCase())
                .includes(val.toLowerCase())
        ) return val
    }
}

const htmlLengthNotSvgError = new Error('Border length must be either thin, medium, thick, or in one of the following units: em, ex, cm, in, mm, px, pc, pt.')

function getWidth(border) {
    if (!border) return false
    border = border.split(' ')
    for (let i in border) {
        i = Number(i)
        const val = border[i]
        // width is 0
        if (val === '0') return '0'
        // width is a word
        if (val.toLowerCase() === 'thin') return '1px'
        if (val.toLowerCase() === 'medium') return '3px'
        if (val.toLowerCase() === 'thick') return '5px'
        if (val.match(/(cap|ch|ic|lh|rem|rlh|vh|vw|vi|vb|vmin|vmax|Q)/g)) throw htmlLengthNotSvgError
        // width is <length>
        if (val.match(/(\d+(\.\d+)?(em|ex|px|cm|mm|in|pc|pt)|0)/g)) return val
    }
}

export {getWidth, getColor}
