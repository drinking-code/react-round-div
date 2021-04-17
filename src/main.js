import React, {useRef, useEffect, useState} from 'react';
import './getMatchedCSSRules-polyfill'
import updateStates from "./updateStates";
import ShadowRoot from "./react-shadow-dom";

export default function RoundDiv({clip, style, children, ...props}) {
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(0)
    const [background, setBackground] = useState('transparent')
    const [backgroundOpacity, setBackgroundOpacity] = useState(0)
    const [borderColor, setBorderColor] = useState('transparent')
    const [borderWidth, setBorderWidth] = useState('1')
    const [borderOpacity, setBorderOpacity] = useState(1)

    const div = useRef()

    useEffect(() => {
        // attach shadow root to div
        if (!div.current?.shadowRoot)
            div.current?.attachShadow({mode: 'open'})
    }, [])

    useEffect(() => updateStates({
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
    }), [div, clip, style])

    const divStyle = {
        ...style
    }

    divStyle.background = 'transparent'
    divStyle.borderWidth = divStyle.borderWidth || '0'
    divStyle.borderColor = 'transparent'

    return <div {...props} style={divStyle} ref={div}>
        <ShadowRoot>
            <style>{`
                rect {
                    width: calc(${width}px + ${borderWidth} * 2);
                    height: calc(${height}px + ${borderWidth} * 2);
                    x: calc(${borderWidth} * -1);
                    y: calc(${borderWidth} * -1);
                }
                #border {
                    stroke-width: ${borderWidth};
                }
            `}
            </style>
            <svg viewBox={`0 0 ${height} ${width}`} style={{
                position: 'fixed',
                height,
                width,
                overflow: 'visible',
                zIndex: -1
            }} xmlnsXlink="http://www.w3.org/1999/xlink">
                <defs>
                    <path d={generateSvgSquircle(height, width, radius, clip)} id="shape"/>

                    <mask id="outsideOnly">
                        <rect fill="white"/>
                        <use xlinkHref="#shape" fill="black"/>
                    </mask>
                </defs>

                <use xlinkHref="#shape" id="border" stroke={borderColor} fill="none"
                     opacity={borderOpacity} mask="url(#outsideOnly)"/>
                <use xlinkHref="#shape" fill={background} opacity={backgroundOpacity}/>
            </svg>
            <slot style={{zIndex: 1}}/>
        </ShadowRoot>
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
