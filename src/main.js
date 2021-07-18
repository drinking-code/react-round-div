import React, {useRef, useEffect, useState, useCallback} from 'react'
import generateSvgSquircle from './generator'
import './getMatchedCSSRules-polyfill'
import updateStates from "./updateStates"
import ShadowRoot from "./react-shadow-dom"
import attachCSSWatcher from './style-sheet-watcher'

export default function RoundDiv({clip, style, children, ...props}) {
    // welcome to react states hell
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(0)

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

    useEffect(updateStatesWithArgs, [div, clip, style, updateStatesWithArgs])

    useEffect(() => {
        attachCSSWatcher(() => updateStatesWithArgs())
    }, [updateStatesWithArgs])

    const path = generateSvgSquircle(height, width, radius, clip)
    const maxBorderWidth = Math.max(...borderWidth)
    const diffBorderMaxWidthLeftWidth = maxBorderWidth - borderWidth[3]
    const diffBorderMaxWidthTopWidth = maxBorderWidth - borderWidth[0]
    // const verticalBorderWidthDelta = maxWidth - borderWidth[2];
    // const horizontalBorderWidthDelta = maxWidth - borderWidth[1];
    const borderPath = generateSvgSquircle(
        height + diffBorderMaxWidthTopWidth + (maxBorderWidth - borderWidth[2]),
        width + diffBorderMaxWidthLeftWidth + (maxBorderWidth - borderWidth[1]),
        radius,
        clip)

    const maskPointsA = {
        to: -borderWidth[0],
        ti: borderWidth[0] * 2,
        ro: width + borderWidth[1],
        ri: width - borderWidth[1] * 2,
        bo: height + borderWidth[2],
        bi: height - borderWidth[2] * 2,
        lo: -borderWidth[3],
        li: borderWidth[3] * 2,
    }

    const maskPoints = {
        tlo: maskPointsA.lo + ',' + maskPointsA.to,
        tli: maskPointsA.li + ',' + maskPointsA.ti,
        tro: maskPointsA.ro + ',' + maskPointsA.to,
        tri: maskPointsA.ri + ',' + maskPointsA.ti,
        blo: maskPointsA.lo + ',' + maskPointsA.bo,
        bli: maskPointsA.li + ',' + maskPointsA.bi,
        bro: maskPointsA.ro + ',' + maskPointsA.bo,
        bri: maskPointsA.ri + ',' + maskPointsA.bi,
    }

    const maskPaths = {
        top: `M${maskPoints.tli}H${maskPointsA.ri}L${maskPoints.tro}H${maskPointsA.lo}Z`,
        right: `M${maskPoints.tri}V${maskPointsA.bi}L${maskPoints.bro}V${maskPointsA.to}Z`,
        bottom: `M${maskPoints.bri}H${maskPointsA.li}L${maskPoints.blo}H${maskPointsA.ro}Z`,
        left: `M${maskPoints.bli}V${maskPointsA.ti}L${maskPoints.tlo}V${maskPointsA.bo}Z`,
    }

    // console.log(borderWidth, borderColor, borderOpacity)
    // console.log(isFlex)

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
                    {Object.keys(maskPaths).map(key => (
                        <clipPath id={key + '-mask'} key={key}>
                            <path d={maskPaths[key]}
                                  transform={`translate(${diffBorderMaxWidthLeftWidth},${diffBorderMaxWidthTopWidth})`}/>
                        </clipPath>
                    ))}
                    <path d={borderPath} fill="none" id="border"/>
                </defs>
                {Object.keys(maskPaths).map((key, i) => (
                    <use href="#border" clipPath={`url(#${key}-mask)`} key={key}
                         strokeWidth={maxBorderWidth * 2} stroke={borderColor[i]} opacity={borderOpacity[i]}
                         transform={`translate(${-diffBorderMaxWidthLeftWidth},${-diffBorderMaxWidthTopWidth})`}/>
                ))}
            </svg>
            <slot/>
        </ShadowRoot>
        {children}
    </div>
}
