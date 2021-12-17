const CSSChangeEvent = typeof CustomEvent !== 'undefined' ? new CustomEvent('css-change') : 'css-change';

export default function attachCSSWatcher(callback) {
    CSSWatcher.addEventListener('css-change', () => callback())
}

const CSSWatcher = new EventTarget()

if (typeof document !== 'undefined') {
    if (document.readyState === 'complete')
        CSSWatcher.dispatchEvent(CSSChangeEvent)
    else
        window.addEventListener('load', () =>
            CSSWatcher.dispatchEvent(CSSChangeEvent)
        )
}

;(function watchCSS() {
    let CSS = getCSSText()
    setInterval(() => {
        const newCSS = getCSSText()
        if (CSS === newCSS) return
        CSS = newCSS
        CSSWatcher.dispatchEvent(CSSChangeEvent)
    }, 30)

    if (typeof window === 'undefined') return
    window.addEventListener('resize', () => {
        CSS = getCSSText()
        CSSWatcher.dispatchEvent(CSSChangeEvent)
    })
})()

function getCSSText() {
    if (typeof document === 'undefined') return ''
    let CSS = ''
    for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i]
        for (let j = 0; j < sheet.rules.length; j++) {
            CSS += sheet.rules[j].cssText
        }
    }
    return CSS
}
