import {
    convertPlainColor,
    convertColorOpacity,
    convertBorderWidth,
    toNumber,
    htmlBorderRadiusNotSvgError, separateInsetBoxShadow
} from './utils/css-utils';
import getAllCssPropertyDeclarationsForElement from './utils/styles-extractor';
import ReactDOM from 'react-dom'
import {lazySetArrayState, lazySetObjectsState} from './utils/react-utils'

export default function updateStates(args) {
    const {div, setPosition, setHeight, setWidth} = args
    const boundingClientRect = div.current?.getBoundingClientRect()
    let height, width;
    if (boundingClientRect) {
        lazySetArrayState(setPosition, [boundingClientRect.x, boundingClientRect.y])
        height = boundingClientRect.height
        width = boundingClientRect.width
        setHeight(height)
        setWidth(width)
    }

    const getNthStyle = (key, n, shorthand) => {
        const styles = getAllCssPropertyDeclarationsForElement(key, div.current, shorthand)
        return styles[n]?.declaration?.value
    }

    const getBorderStyles = (key, n) => [
        getNthStyle('border-top-' + key, n, 'border'),
        getNthStyle('border-right-' + key, n, 'border'),
        getNthStyle('border-bottom-' + key, n, 'border'),
        getNthStyle('border-left-' + key, n, 'border'),
    ]

    const getBorderRadii = (n) => [
        getNthStyle('border-top-right-radius', n, 'border-radius'),
        getNthStyle('border-top-left-radius', n, 'border-radius'),
        getNthStyle('border-bottom-right-radius', n, 'border-radius'),
        getNthStyle('border-bottom-left-radius', n, 'border-radius'),
    ]

    const states = args
    const lazySetRadius = newState => lazySetArrayState(states.setRadius, newState),
        lazySetBackground = newState => lazySetObjectsState(states.setBackground, newState),
        lazySetBorderColor = newState => lazySetArrayState(states.setBorderColor, newState),
        lazySetBorderOpacity = newState => lazySetArrayState(states.setBorderOpacity, newState),
        lazySetBorderWidth = newState => lazySetArrayState(states.setBorderWidth, newState),
        lazySetShadows = newState => lazySetArrayState(states.setShadows, newState)

    const divStyle = div.current ? window?.getComputedStyle(div.current) : null
    if (!divStyle) return
    ReactDOM.unstable_batchedUpdates(() => {
        lazySetRadius(
            getBorderRadii(0)
                .map(s => Math.min(
                    toNumber(s, div.current, htmlBorderRadiusNotSvgError),
                    height / 2,
                    width / 2
                ))
        )

        lazySetBackground(
            Object.fromEntries([
                'attachment',
                'clip',
                'color',
                'image',
                'origin',
                'position',
                'repeat',
                'size'
            ].map(key =>
                [key, getNthStyle('background-' + key, 1, 'background')]
            ))
        )

        lazySetShadows(
            separateInsetBoxShadow(
                getNthStyle('box-shadow', 1)
            )
        )

        // get color
        lazySetBorderColor(
            getBorderStyles('color', 1)
                .map(s => convertPlainColor(s))
        )
        // get alpha value of color
        lazySetBorderOpacity(
            getBorderStyles('color', 1)
                .map(s => convertColorOpacity(s))
        )

        lazySetBorderWidth(
            getBorderStyles('width', 0)
                .map(s => convertBorderWidth(s, div.current))
        )
    })
}
