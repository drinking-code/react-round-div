import {
    convertPlainColor,
    convertColorOpacity,
    convertBorderWidth,
    toNumber,
    htmlBorderRadiusNotSvgError
} from "./css-utils";
import getStyle from "./external/styles-extractor";

export default function updateStates(args) {
    const {div, setHeight, setWidth} = args
    const boundingClientRect = div.current?.getBoundingClientRect()
    if (boundingClientRect) {
        setHeight(boundingClientRect.height)
        setWidth(boundingClientRect.width)
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

        const normal = getStyle(key, div.current);
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

    const divStyle = div.current ? window?.getComputedStyle(div.current) : null
    if (divStyle) {
        let states = args
        states.setRadius(
            getBorderRadii(1)
                .map(s => toNumber(s, div.current, htmlBorderRadiusNotSvgError))
        )

        // get color
        states.setBorderColor(
            getBorderStyles('color', 1)
                .map(s => convertPlainColor(s))
        )
        // get alpha value of color
        states.setBorderOpacity(
            getBorderStyles('color', 1)
                .map(s => convertColorOpacity(s))
        )

        states.setBorderWidth(
            getBorderStyles('width', 0)
                .map(s => convertBorderWidth(s, div.current))
        )

        states.setIsFlex(
            getNthStyle('display', 0)?.endsWith('flex') || false
        )
    }
}
