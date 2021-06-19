const CSSChangeEvent = new CustomEvent('css-change');

export default function attachCSSWatcher(callback) {
    CSSWatcher.addEventListener('css-change', () => callback())
}

const CSSWatcher = new EventTarget()

;(function watchCSS() {
    let CSS = getCSSText()
    setInterval(() => {
        const newCSS = getCSSText()
        if (CSS === newCSS) return
        CSS = newCSS
        CSSWatcher.dispatchEvent(CSSChangeEvent)
    }, 1000)
})()

function getCSSText() {
    let CSS = ''
    for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i]
        for (let j = 0; j < sheet.rules.length; j++) {
            CSS += sheet.rules[j].cssText
        }
    }
    return CSS
}
