import {getColor, getOpacity, getWidth, unitCheck} from "./css-utils";
import getStyle from "./styles-extractor";

export default function updateStates(args) {
    const {
        div,
        style,
        setHeight,
        setWidth,
        setRadius,
        setBackground,
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
    const divStyle = boundingClientRect ? window?.getComputedStyle(div.current) : null
    if (divStyle) {
        setRadius(Number(
            (divStyle.borderRadius || divStyle.borderTopLeftRadius)
                .replace('px', '')))
        setBackground(getColor(
            style?.background
            || style?.backgroundColor
            || (getStyle('background', div.current)?.overwritten || [])[1]?.value
            || (getStyle('background-color', div.current)?.overwritten || [])[1]?.value
        ) || 'transparent')
        setBackgroundOpacity(getOpacity(
            style?.background
            || style?.backgroundColor
            || (getStyle('background', div.current)?.overwritten || [])[1]?.value
            || (getStyle('background-color', div.current)?.overwritten || [])[1]?.value
        ) || 1)
        setBorderColor(getColor(
            style?.border
            || style?.borderColor
            || (getStyle('borderColor', div.current)?.overwritten || [])[1]?.value
            || (getStyle('borderTopColor', div.current)?.overwritten || [])[1]?.value
        ) || 'transparent')
        setBorderWidth(
            getWidth(style?.border)
            || style?.borderWidth
            || unitCheck((getStyle('borderWidth', div.current)?.overwritten || [])[0]?.value)
            || unitCheck((getStyle('borderTopWidth', div.current)?.overwritten || [])[0]?.value)
            || '1'
        )
        setBorderOpacity(getOpacity(
            style?.border
            || style?.borderColor
            || (getStyle('borderColor', div.current)?.overwritten || [])[1]?.value
            || (getStyle('borderTopColor', div.current)?.overwritten || [])[1]?.value
        ) || 1)
    }
}
