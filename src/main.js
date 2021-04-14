import React, {useRef, useEffect, useState} from 'react';
import getStyle from "./styles-extractor";
import './getMatchedCSSRules-polyfill'

export default function RoundDiv({clip, style, children, ...props}) {
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [offsetX, setOffsetX] = useState(0)
    const [offsetY, setOffsetY] = useState(0)
    const [radius, setRadius] = useState(0)
    const [background, setBackground] = useState('transparent')

    const div = useRef()

    useEffect(() => {
        // attach shadow root to div
        if (div.current?.shadowRoot) return
        const shadow = div.current?.attachShadow({mode: 'open'})
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        svg.style.position = 'fixed';
        svg.style.left = '0px';
        svg.style.top = '0px';
        svg.style.height = '0px';
        svg.style.width = '0px';
        svg.style.zIndex = '-1';
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        svg.appendChild(path)
        shadow.appendChild(svg)
        const content = document.createElement('slot')
        shadow.appendChild(content)
    }, [])

    useEffect(() => {
        const boundingClientRect = div.current?.getBoundingClientRect()
        if (boundingClientRect) {
            setHeight(boundingClientRect.height)
            setWidth(boundingClientRect.width)
            setOffsetX(boundingClientRect.left)
            setOffsetY(boundingClientRect.top)
        }
        const divStyle = boundingClientRect ? window?.getComputedStyle(div.current) : null
        if (divStyle) {
            setRadius(Number(divStyle.borderRadius.replace('px', '')))
            setBackground(
                style?.background
                || style?.backgroundColor
                || getStyle('background', div.current)?.overwritten[1]?.value
                || 'transparent'
            )
        }
    }, [div, clip, style])

    useEffect(() => {
        const path = div.current?.shadowRoot?.querySelector('path')
        if (!path) return
        path.parentNode.style.width = width
        path.parentNode.style.height = height
        path.parentNode.style.top = offsetY
        path.parentNode.style.left = offsetX
        path.parentNode.removeAttributeNS('http://www.w3.org/2000/svg', 'viewBox')
        path.parentNode.setAttributeNS(
            'http://www.w3.org/2000/svg',
            'viewBox',
            `0 0 ${height} ${width}`
        )
        const newPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        newPath.setAttributeNS(
            'http://www.w3.org/2000/svg',
            'd',
            generateSvgSquircle(height, width, radius, clip)
        )
        newPath.setAttributeNS('http://www.w3.org/2000/svg', 'fill', background)
        // rerender
        path.parentNode.innerHTML = newPath.outerHTML
    }, [background, height, width, radius, clip, offsetX, offsetY])

    const divStyle = {
        ...style
    }

    divStyle.background = 'transparent'
    divStyle.border = 'none'

    return <div {...props} style={divStyle} ref={div}>
        {children}
    </div>
}

function generateSvgSquircle(height, width, radius, clip) {
    const RADIUS_SCALE_FACTOR = 1.25
    height = Number(height);
    width = Number(width);
    radius = clip === false
        ? Number(radius)
        : Math.min(Number(radius), height / 2 / RADIUS_SCALE_FACTOR, width / 2 / RADIUS_SCALE_FACTOR);
    if (isNaN(height)) throw new Error(`'height' must be a number`);
    if (isNaN(width)) throw new Error(`'width' must be a number`);
    if (isNaN(radius)) throw new Error(`'radius' must be a number`);
    const point = RADIUS_SCALE_FACTOR * radius,
        bezier = radius / 3;

    return `M 0,${point} C 0,${bezier}, ${bezier},0, ${point},0
        L ${width - point},0 C ${width - bezier},0, ${width},${bezier}, ${width},${point}
        L ${width},${height - point} C ${width},${height - bezier}, ${width - bezier},${height}, ${width - point},${height}
        L ${point},${height} C ${bezier},${height}, 0,${height - bezier}, 0,${height - point}
        Z`;
}
