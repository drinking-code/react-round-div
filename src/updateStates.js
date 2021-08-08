import {
    convertPlainColor,
    convertColorOpacity,
    convertBorderWidth,
    toNumber,
    htmlBorderRadiusNotSvgError
} from "./css-utils";
import getStyle from "./external/styles-extractor";
import ReactDOM from 'react-dom'

// prevents unnecessary re-renders:
// single value states (numbers and strings) prevent this out of the box,
// complex states (objects, arrays, etc.) don't, so here it is manually for arrays (non-nested)
const lazySetArrayState = (setState, newState) =>
    setState(oldState => {
        if (oldState.every((val, i) => val === newState[i])) return oldState
        else return newState
    })

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

    function camelise(str) {
        return str?.replace(/^\w|[A-Z]|\b\w|\s+/g, function (match, index) {
            if (+match === 0) return "";
            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        }).replace(/-/g, '');
    }

    const getNthStyle = (key, n) => {
        const returnNthOverwrittenOrCurrent = r =>
            !r ? false :
                r?.overwritten.length > 1
                    ? r.overwritten[n ?? 0].value
                    : r.current?.value

        const normal = getStyle(key, div.current)
        const camelised = getStyle(camelise(key), div.current)

        return returnNthOverwrittenOrCurrent(normal) || returnNthOverwrittenOrCurrent(camelised)
    };

    const getBorderStyles = (key, n) => [
        getNthStyle('border-top-' + key, n),
        getNthStyle('border-right-' + key, n),
        getNthStyle('border-bottom-' + key, n),
        getNthStyle('border-left-' + key, n),
    ]

    const getBorderRadii = (n) => [
        getNthStyle('border-top-right-radius', n),
        getNthStyle('border-top-left-radius', n),
        getNthStyle('border-bottom-right-radius', n),
        getNthStyle('border-bottom-left-radius', n),
    ]

    const states = args
    const lazySetRadius = newState => lazySetArrayState(states.setRadius, newState),
        lazySetBorderColor = newState => lazySetArrayState(states.setBorderColor, newState),
        lazySetBorderOpacity = newState => lazySetArrayState(states.setBorderOpacity, newState),
        lazySetBorderWidth = newState => lazySetArrayState(states.setBorderWidth, newState)

    const divStyle = div.current ? window?.getComputedStyle(div.current) : null
    if (!divStyle) return
    ReactDOM.unstable_batchedUpdates(() => {
        lazySetRadius(
            getBorderRadii(1)
                .map(s => Math.min(
                    toNumber(s, div.current, htmlBorderRadiusNotSvgError),
                    height / 2,
                    width / 2
                ))
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
