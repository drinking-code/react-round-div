import CSS_COLOR_NAMES from '../external/bobspace:html-colors';

const toPx = typeof document !== 'undefined' && require('../external/heygrady:units:length').default;

export function toNumber(length, element) {
    if (!length) return false
    if (typeof length === 'number' || !length.match(/\D+/))
        return Number(length);
    return toPx(element, length)
}

/** @returns {number} */
export function convertBorderWidth(val, element) {
    if (!val) return 0
    // width is a word
    return {
        thin: 1,
        medium: 3,
        thick: 5
    }[val?.toLowerCase()]
        // width is <length>
        ?? (toNumber(val, element) || 0)
}

export function separateInsetBoxShadow(val) {
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

export function iterateAllCssRules(callback) {
    for (let index in document.styleSheets) {
        if (!document.styleSheets.hasOwnProperty(index)) continue
        const styleSheet = document.styleSheets.item(Number(index))
        if (styleSheet.disabled) continue
        for (let index in styleSheet.cssRules) {
            if (!styleSheet.cssRules.hasOwnProperty(index)) continue
            const rule = styleSheet.cssRules.item(Number(index))
            callback(rule, index)
        }
    }
}
