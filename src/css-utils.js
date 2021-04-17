import CSS_COLOR_NAMES from "./html-colors";

function _getAttributeFromString(string, method) {
    if (!string) return false
    string = string.split(' ')
    for (let i in string) {
        const res = method(string, Number(i))
        if (res) return res
    }
}

function _getColor(border, i) {
    const val = border[i]
    // color is a hex code
    if (val.toLowerCase().match(/#([0-9a-f]{3}){1,2}/)) return val
    // color is a function (rgb, rgba, hsl, hsla)
    if (val.startsWith('rgb') || val.startsWith('hsl')) {
        let color = val;
        if (!val.endsWith(')'))
            for (let j = 1; !border[i + j - 1].endsWith(')'); j++) {
                color += border[i + j]
            }
        if (color[3] === 'a')
            color = color.replace('a', '').replace(/,[^),]+\)/, ')')
        return color
    }
    // color is a html color name
    if (
        CSS_COLOR_NAMES.map(color => color.toLowerCase())
            .includes(val.toLowerCase())
    ) return val
    return false
}

function _getOpacity(border, i) {
    let val = border[i]
    if (val.startsWith('rgba') || val.startsWith('hsla')) {
        if (!val.endsWith(')'))
            for (let j = 1; !border[i + j - 1].endsWith(')'); j++) {
                val += border[i + j]
            }
        return val.replace(/(rgb|hsl)a?\(([^,)]+,){3}/, '').replace(/\)$/, '')
    }
    if (border.length - 1 === i)
        return 1
}

const htmlLengthNotSvgError = new Error('<RoundDiv> Border lengths must be either "thin", "medium", "thick", or in one of the following units: em, ex, cm, in, mm, px, pc, pt.')

function unitCheck(length) {
    if (length?.match(/(cap|ch|ic|lh|rem|rlh|vh|vw|vi|vb|vmin|vmax|Q)/g)) throw htmlLengthNotSvgError
    return length
}

function _getWidth(border, i) {
    const val = border[i]
    // width is 0
    if (val === '0') return '0'
    // width is a word
    if (val.toLowerCase() === 'thin') return '1px'
    if (val.toLowerCase() === 'medium') return '3px'
    if (val.toLowerCase() === 'thick') return '5px'
    unitCheck(val)
    // width is <length>
    if (val.match(/(\d+(\.\d+)?(em|ex|px|cm|mm|in|pc|pt)|0)/g)) return val
    return false
}

const getWidth = s => _getAttributeFromString(s, _getWidth),
    getColor = s => _getAttributeFromString(s, _getColor),
    getOpacity = s => _getAttributeFromString(s, _getOpacity)

export {getWidth, getColor, unitCheck, getOpacity}
