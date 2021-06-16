import React, {useRef, useEffect, useState} from 'react'
import generateSvgSquircle from './generator'
import './getMatchedCSSRules-polyfill'
import updateStates from "./updateStates"
import ShadowRoot from "./react-shadow-dom"

export default function RoundDiv({clip, style, children, ...props}) {
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(0)
    const [background, setBackground] = useState('transparent')
    const [backgroundOpacity, setBackgroundOpacity] = useState(0)
    const [borderColor, setBorderColor] = useState('transparent')
    const [borderWidth, setBorderWidth] = useState(0)
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
            <svg viewBox={`0 0 ${width} ${height}`} style={{
                position: 'fixed',
                height,
                width,
                overflow: 'visible',
                zIndex: -1
            }} xmlnsXlink="http://www.w3.org/1999/xlink">
                <defs>
                    <path d={
                        generateSvgSquircle(height + borderWidth * 2, width + borderWidth * 2, radius, clip)
                    } id="shape"/>

                    <clipPath id="insideOnly">
                        <use xlinkHref="#shape" fill="black"/>
                    </clipPath>
                </defs>
                <use xlinkHref="#shape" fill={background} opacity={backgroundOpacity}
                     x={-borderWidth} y={-borderWidth}/>
                <use xlinkHref="#shape" stroke={borderColor} fill="none" strokeWidth={borderWidth * 2}
                     opacity={borderOpacity} clipPath="url(#insideOnly)" x={-borderWidth} y={-borderWidth}/>
            </svg>
            <slot/>
        </ShadowRoot>
        {children}
    </div>
}
