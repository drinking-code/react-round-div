import CSS_COLOR_NAMES from "./html-colors";
import toPx from "./css-length-converter";

function _getAttributeFromString(string, method, ...data) {
    if (!string) return false
    string = string.split(' ')
    for (let i in string) {
        if (!string.hasOwnProperty(i)) continue
        const res = method(string, Number(i), ...data)
        if (res) return res
    }
}

function _getColor(b, i) {
    const val = b[i]
    // color is a hex code
    if (val.toLowerCase().match(/#([0-9a-f]{3}){1,2}/)) return val
    // color is a function (rgb, rgba, hsl, hsla)
    if (val.startsWith('rgb') || val.startsWith('hsl')) {
        let color = val;
        if (!val.endsWith(')'))
            for (let j = 1; !b[i + j - 1].endsWith(')'); j++) {
                color += b[i + j]
            }
        if (color[3] === 'a')
            color = color.replace('a', '').replace(/,[^),]+\)/, ')')
        return color
    }
    // color is a html color name
    if (CSS_COLOR_NAMES.map(color => color.toLowerCase())
        .includes(val.toLowerCase()))
        return val
    if (val === 'currentcolor') {
        return 'currentcolor'
    }
    return false
}

function _getImage(b, i) {
    const val = b[i]

    if (val.startsWith('url')) {
        let url = val;
        for (let j = 1; b[i + j]; j++) {
            url += b[i + j]
        }
        url = /url\(("[^"]+"|'[^']+'|[^)]+)\)/g.exec(url)
        url = url ? url[1] : false
        url = url?.startsWith('"') || url?.startsWith("'")
            ? url.substr(1, url.length - 2)
            : url
        return url
    }
}

function _getImageSize(b, i, element) {
    // "val" is always what is defined in backgrund-size ([i]th argument)
    const val = b[i]

    if (['cover', 'contain'].includes(val)) {
        return [val, null]
    }

    const returnIfCSSNumeric = (val, throwErr) => {
        if (val?.endsWith('%'))
            return val
        else if (val?.match(/(\d+(\.\d+)?(ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmax|vmin|vw)|0)/)) {
            unitCheck(val, throwErr ? htmlBackgroundSizeNotSvgError : undefined)
            return toPx(element, val)
        } else
            return null
    }

    const convertedVal = returnIfCSSNumeric(val, true) // has null as fallback already
    // "background-size: 50% 50%" is different to "background-size: 50%"
    return [convertedVal, returnIfCSSNumeric(b[i + 1])]
}

function _getOpacity(b, i) {
    let val = b[i]
    if (val.startsWith('rgba') || val.startsWith('hsla')) {
        if (!val.endsWith(')'))
            for (let j = 1; !b[i + j - 1].endsWith(')'); j++) {
                val += b[i + j]
            }
        return val.replace(/(rgb|hsl)a?\(([^,)]+,){3}/, '').replace(/\)$/, '')
    }
    if (b.length - 1 === i)
        return 1
}

function _getRepeat(b, i) {
    let val = b[i]
    if (val === 'repeat-x')
        return ['repeat', 'no-repeat']
    else if (val === 'repeat-y')
        return ['no-repeat', 'repeat']
    else if (['repeat', 'space', 'round', 'no-repeat'].includes(val)) {
        if (['repeat', 'space', 'round', 'no-repeat'].includes(b[i + 1] || ''))
            return [val, b[i + 1]]
        else
            return [val, val]
    }
}

const htmlLengthNotSvgErrorTemplate = (a, b) => `<RoundDiv> ${a} must be ${b ? `either ${b}, or` : ''} in one of the following units: ch, cm, em, ex, in, mm, pc, pt, px, rem, vh, vmax, vmin, vw.`
const htmlBorderLengthNotSvgError =
    new Error(htmlLengthNotSvgErrorTemplate('border lengths', '"thin", "medium", "thick"'))
const htmlBackgroundSizeNotSvgError =
    new Error(htmlLengthNotSvgErrorTemplate('background size', '"cover", "contain"'))

function unitCheck(length, err) {
    if (length?.match(/(cap|ic|lh|rlh|vi|vm|vb|Q|mozmm)/g))
        if (err) throw err
        else return false
    return length
}

function _getWidth(border, i, element) {
    const val = border[i]
    // width is 0
    if (val === '0') return 0
    // width is a word
    if (val.toLowerCase() === 'thin') return 1
    if (val.toLowerCase() === 'medium') return 3
    if (val.toLowerCase() === 'thick') return 5
    unitCheck(val, htmlBorderLengthNotSvgError)
    // width is <length>
    if (val.match(/(\d+(\.\d+)?(ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmax|vmin|vw)|0)/))
        return toPx(element, val)
    return false
}

/** @returns {number} */
const getWidth = (s, el) => _getAttributeFromString(s, _getWidth, el),
    /** @returns {string} */
    getImage = s => _getAttributeFromString(s, _getImage),
    /** @returns {Array<string|number>} */
    getImageSize = (s, el) => _getAttributeFromString(s, _getImageSize, el),
    /** @returns {string} */
    getColor = s => _getAttributeFromString(s, _getColor),
    /** @returns {Array<string>} */
    getRepeat = s => _getAttributeFromString(s, _getRepeat),
    /** @returns {number} */
    getOpacity = s => _getAttributeFromString(s, _getOpacity)

export {getWidth, getImage, getImageSize, getColor, getRepeat, getOpacity}
