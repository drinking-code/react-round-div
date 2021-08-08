const CSSChangeEvent = new CustomEvent('css-change');

export default function attachCSSWatcher(callback) {
    // attach later, after loading is done
    setTimeout(() =>
            CSSWatcher.addEventListener('css-change', () => callback())
        , 20)
}

const CSSWatcher = new EventTarget()

;(function watchCSS() {
    let CSS = getCSSText()
    setInterval(() => {
        const newCSS = getCSSText()
        if (CSS === newCSS) return
        CSS = newCSS
        CSSWatcher.dispatchEvent(CSSChangeEvent)
    }, 30)
    window.addEventListener('resize', () => {
        CSS = getCSSText()
        CSSWatcher.dispatchEvent(CSSChangeEvent)
    })
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
