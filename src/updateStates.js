import {getColor, getImage, getImageSize, getOpacity, getWidth} from "./css-utils";
import getStyle from "./styles-extractor";

export default function updateStates(args) {
    const {
        div,
        style,
        setHeight,
        setWidth,
        setRadius,
        setBackground,
        setBackgroundImage,
        setBackgroundImageSize,
        setBackgroundOpacity,
        setBorderColor,
        setBorderWidth,
        setBorderOpacity
    } = args
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

    const getNthStyle = (key, n) =>
            (getStyle(camelise(key), div.current)?.overwritten || [])[n]?.value,

        getNthStyleAttrOrAlt = (...args) => {
            args = Array.from(args)
            let n = args.pop()
            if (typeof n !== 'number') {
                args.push(n)
                n = 0
            }

            let a, b, c, d
            if (args.length === 2)
                [a, b, c, d] = [args[0], args[1], args[0], args[1]]
            else if (args.length === 3)
                [a, b, c, d] = [args[0], args[1], args[1], args[2]]

            return style ? style[camelise(a)] || style[camelise(b)]
                : getNthStyle(c, n) || getNthStyle(d, n)
        },
        getNthStyleAttr = (a, n) =>
            style ? style[camelise(a)] : getNthStyle(a, n)

    const divStyle = div.current ? window?.getComputedStyle(div.current) : null
    if (divStyle) {
        setRadius(Number(
            (divStyle.borderRadius || divStyle.borderTopLeftRadius)
                .replace('px', ''))
        )
        setBackground(getColor(
            getNthStyleAttrOrAlt('background', 'background-color', 1)
        ) || 'transparent')
        setBackgroundImage(getImage(
            getNthStyleAttrOrAlt('background', 'background-image', 1)
        ) || 'none')
        setBackgroundImageSize(getImageSize(
            getNthStyleAttr('background-size', 1)
        ) || null)
        setBackgroundOpacity(getOpacity(
            getNthStyleAttrOrAlt('background', 'background-color', 1)
        ) || 1)

        setBorderColor(getColor(
            getNthStyleAttrOrAlt('border', 'border-color', 'border-top-color', 1)
        ) || 'transparent')
        setBorderOpacity(getOpacity(
            getNthStyleAttrOrAlt('border', 'border-color', 'border-top-color', 1)
        ) || 1)

        setBorderWidth(getWidth(
            getNthStyleAttrOrAlt('border', 'border-width', 'border-top-width', 0),
            div.current
        ) || 0)
    }
}
