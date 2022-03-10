import {iterateAllCssRules} from './utils/css-utils'
import {areEqualObjects} from './utils/assert'

let id = 0
const listeners = []

export function attachCSSWatcher(callback, element) {
    listeners[id] = watchCSS(callback, element)
    return id++
}

export function detachCSSWatcher(id) {
    listeners[id]()
    delete listeners[id]
}

function watchCSS(callback, element) {
    let CSS = getCSSText(element)
    let style = {...element.style}
    const interval = setInterval(() => {
        const newCSS = getCSSText(element)
        const newStyle = {...element.style}
        if (CSS === newCSS && areEqualObjects(style, newStyle)) return
        CSS = newCSS
        style = newStyle
        callback()
    }, 50)

    let timeout
    const forceUpdate = () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            CSS = getCSSText(element)
            style = {...element.style}
            callback()
        }, 0)
    }

    window.addEventListener('resize', forceUpdate)
    window.addEventListener('scroll', forceUpdate, {passive: true})

    return () => {
        clearInterval(interval)
        window.removeEventListener('resize', forceUpdate)
        window.removeEventListener('scroll', forceUpdate, {passive: true})
    }
}

function getCSSText(element) {
    let CSS = ''
    iterateAllCssRules(rule => {
        try {
            if (!rule.selectorText || !element.matches(rule.selectorText)) return
        } catch (e) {
            return
        }
        CSS += rule.cssText
    })
    return CSS
}
