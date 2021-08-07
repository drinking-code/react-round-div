import React, {useRef, useEffect, useState, useCallback} from 'react'
import generateSvgSquircle from './generator'
import './external/getMatchedCSSRules-polyfill'
import updateStates from "./updateStates"
import ShadowRoot from "./external/apearce:eact-shadow-dom"
import attachCSSWatcher from './styleSheetWatcher'
import getMaskPaths from './mask-generator'

export default function RoundDiv({style, children, ...props}) {
    // welcome to react states hell
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(Array(4).fill(0))

    const [borderColor, setBorderColor] = useState(Array(4).fill('transparent'))
    const [borderOpacity, setBorderOpacity] = useState(Array(4).fill(1))
    const [borderWidth, setBorderWidth] = useState(Array(4).fill(0))

    const [isFlex, setIsFlex] = useState(false)

    const div = useRef()

    useEffect(() => {
        // attach shadow root to div
        if (!div.current?.shadowRoot)
            div.current?.attachShadow({mode: 'open'})
    }, [])

    const updateStatesWithArgs = useCallback(() => updateStates({
        div,
        style,
        setHeight,
        setWidth,
        setRadius,
        setBorderColor,
        setBorderWidth,
        setBorderOpacity,
        setIsFlex
    }), [style])

    useEffect(updateStatesWithArgs, [div, style, updateStatesWithArgs])

    useEffect(() => {
        attachCSSWatcher(() => updateStatesWithArgs())
    }, [updateStatesWithArgs])

    const path = generateSvgSquircle(height, width, radius)
    const innerPath = generateSvgSquircle(
        height - (borderWidth[0] + borderWidth[2]),
        width - (borderWidth[1] + borderWidth[3]),
        radius.map((val, i) =>
            Math.max(0,
                val - Math.max(borderWidth[i], borderWidth[i === 0 ? 3 : i - 1])
            )
        )
    ).replace(
        /(\d+(\.\d+)?),(\d+(\.\d+)?)/g,
        match => match.split(',').map((number, i) =>
            Number(number) + (i === 0 ? borderWidth[3] : borderWidth[0])
        ).join(',')
    )

    const maskPaths = getMaskPaths(borderWidth, height, width)

    const svgTransform = isFlex
        ? `translate(${(borderWidth[1] - borderWidth[3]) / 2}px,${(borderWidth[2] - borderWidth[0]) / 2}px)`
        : `translate(${(borderWidth[1] - borderWidth[3]) / 2}px,-${borderWidth[0]}px)`

    const divStyle = {
        ...style,
        clipPath: `path("${path}")`,
        borderColor: 'transparent'
    }

    return <div {...props} style={divStyle} ref={div}>
        <ShadowRoot>
            <svg viewBox={`0 0 ${width} ${height}`} style={{
                position: 'absolute',
                height,
                width: 1,
                overflow: 'visible',
                zIndex: -1,
                transform: svgTransform
            }} xmlnsXlink="http://www.w3.org/1999/xlink" preserveAspectRatio={'xMidYMid slice'}>
                <defs>
                    <clipPath id="inner">
                        <path d={`M0,0V${height}H${width}V0Z` + innerPath} fillRule={'evenodd'}/>
                    </clipPath>
                </defs>
                {Object.keys(maskPaths).map((key, i) => {
                    if (borderColor[i] === borderColor[i - 1]) return ''

                    let path = maskPaths[key]
                    while (borderColor[i] === borderColor[i + 1]) {
                        path += maskPaths[Object.keys(maskPaths)[i + 1]]
                        i++
                    }

                    return <path d={path} clipPath={'url(#inner)'} key={key}
                                 fill={borderColor[i]} opacity={borderOpacity[i]}/>
                })}
            </svg>
            <slot/>
        </ShadowRoot>
        {children}
    </div>
}
