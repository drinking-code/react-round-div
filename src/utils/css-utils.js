import CSS_COLOR_NAMES from '../external/bobspace:html-colors';

const toPx = typeof document !== 'undefined' && require('../external/heygrady:units:length').default;

/** @returns {string} */
function convertPlainColor(val) {
    if (!val) return '#000'
    val = val?.toLowerCase()
    // color is a hex code
    if (val?.match(/#([0-9a-f]{3}){1,2}/)) return val
    // color is a function (rgb, rgba, hsl, hsla)
    else if (val?.match(/^(rgb|hsl)a?\(([^,]{1,3},? *){3}(\d*\.?\d+)?\)/))
        return val
            .replace('a', '')
            .replace(/\((([\d%]{1,3}, *){2}([\d%]{1,3}))(, *\d*\.?\d+)?\)/, '($1)')
    // color is a html color name
    else if (CSS_COLOR_NAMES.map(color => color.toLowerCase())
        .includes(val.toLowerCase()))
        return val
    else if (val === 'currentcolor') {
        return 'currentcolor'
    } else return '#000'
}

/** @returns {number} */
function convertColorOpacity(val) {
    if (val === 'transparent' || val === undefined) {
        return 0
    } else if (val?.startsWith('rgba') || val?.startsWith('hsla')) {
        return Number(val.match(/(\d*\.?\d+)?\)$/)[1])
    } else if (CSS_COLOR_NAMES.map(color => color.toLowerCase())
        .includes(val.toLowerCase()))
        return 1
    else
        return 0
}

const htmlLengthNotSvgErrorTemplate = (a, b) => `<RoundDiv> ${a} must be ${b ? `either ${b}, or` : ''} in one of the following units: ch, cm, em, ex, in, mm, pc, pt, px, rem, vh, vmax, vmin, vw.`
const htmlBorderLengthNotSvgError =
    new Error(htmlLengthNotSvgErrorTemplate('border lengths', '"thin", "medium", "thick"'))
const htmlBorderRadiusNotSvgError =
    new Error(htmlLengthNotSvgErrorTemplate('border radii'))

function toNumber(length, element, err) {
    if (!length) return false
    if (typeof length === 'number' || !length.match(/\D+/))
        return Number(length);
    else if (length?.match(/(cap|ic|lh|rlh|vi|vm|vb|Q|mozmm)/g))
        if (err) throw err
        else return false
    else if (length?.match(/(\d+(\.\d+)?(ch|cm|em|ex|in|mm|pc|pt|px|rem|vh|vmax|vmin|vw)|0)/))
        if (typeof toPx === 'function')
            return toPx(element, length)
        else if (length.endsWith('px'))
            return Number(length.substring(0, length.length - 2))
        else
            return false
}

/** @returns {number} */
function convertBorderWidth(val, element) {
    if (!val) return 0
    // width is a word
    if (val?.toLowerCase() === 'thin')
        return 1
    else if (val?.toLowerCase() === 'medium')
        return 3
    else if (val?.toLowerCase() === 'thick')
        return 5
    // width is <length>
    else
        return toNumber(val, element, htmlBorderLengthNotSvgError) || 0
}

function separateInsetBoxShadow(val) {
    if (!val || val === '') return [[], []]

    const insetRegExpString = 'inset'
    const singleLengthRegExpString = '-?\\d+(\\.\\d+)?[a-zQ]{2,5}'
    const lengthRegExpString = `(${singleLengthRegExpString} ){2,3}(${singleLengthRegExpString})`
    const colorRegExpString = '((rgb|hsl)a?|hwb)\\((\\d*\\.?\\d+%?, ?){3}(\\d*\\.?\\d+)\\)|currentcolor|#([0-9a-f]{3}){2}|(' + CSS_COLOR_NAMES.join('|') + ')'
    const regExpComponent = `(${insetRegExpString}|${lengthRegExpString}|${colorRegExpString})`
    const regExp = new RegExp(`(${regExpComponent} ){1,2}(${regExpComponent})`, 'g')

    const shadowsWithInset = []
    const shadowsWithoutInset = []
    Array.from(val.matchAll(regExp)).map(matches => {
        const match = matches[0]
        ;(match.match(/inset/g) ? shadowsWithInset : shadowsWithoutInset).push(match)
    })
    return [shadowsWithoutInset, shadowsWithInset]
}

export {
    convertPlainColor,
    convertColorOpacity,
    convertBorderWidth,
    toNumber,
    separateInsetBoxShadow,
    htmlBorderRadiusNotSvgError
}
