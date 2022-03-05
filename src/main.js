import React, {useRef, useEffect, useState, useCallback} from 'react'

const ShadowRoot = typeof window !== 'undefined' ? require('react-shadow-root').default : () => 0

import generateSvgSquircle from './generator'
import getMaskPaths from './mask-generator'
import attachCSSWatcher from './styleSheetWatcher'
import updateStates from './updateStates'

import {lazySetObjectsState} from './utils/react-utils'
import {camelise} from './utils/string-manipulation'

/**
 * @function RoundDiv
 * @extends React.PureComponent
 * */
export default function RoundDiv({style, children, dontConvertShadow, ...props}) {
    // welcome to react states hell
    const [position, setPosition] = useState([0, 0])
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(Array(4).fill(0))

    const [borderColor, setBorderColor] = useState(Array(4).fill('transparent'))
    const [borderOpacity, setBorderOpacity] = useState(Array(4).fill(0))
    const [borderWidth, setBorderWidth] = useState(Array(4).fill(0))
    const [background, setBackground] = useState({})
    const [shadows, setShadows] = useState(Array(2).fill([]))

    const [path, setPath] = useState('Z')
    const [innerPath, setInnerPath] = useState('Z')
    const [maskPaths, setMaskPaths] = useState('Z')

    const div = useRef()

    const updateStatesWithArgs = useCallback(() => {
        updateStates({
            div,
            style,
            setPosition,
            setHeight,
            setWidth,
            setRadius,
            setBackground,
            setBorderColor,
            setBorderWidth,
            setBorderOpacity,
            setShadows
        })
    }, [style])

    useEffect(updateStatesWithArgs, [style, updateStatesWithArgs])

    useEffect(() => {
        attachCSSWatcher(() => updateStatesWithArgs()) // todo: make this a react hook
    }, [updateStatesWithArgs])

    const svgRef = useRef();

    useEffect(() => {
        setPath(generateSvgSquircle(height, width, radius))
        setInnerPath(generateSvgSquircle(
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
        ))

        lazySetObjectsState(setMaskPaths, getMaskPaths(borderWidth, height, width, radius))

        // patch for webkit's svg bug
        if (svgRef.current)
            setTimeout(() => {
                svgRef.current.style.position = ''
                setTimeout(() => {
                    svgRef.current.style.position = 'fixed'
                }, 0)
            }, 0)
    }, [height, width, radius, borderWidth])

    const pathIsEmpty = (path.startsWith('Z') || path === '')
    const divStyle = {
        ...style,
        ...(pathIsEmpty ? {} : {
            borderColor: 'transparent',
            background: 'transparent',
            boxShadow: dontConvertShadow
                // "box-shadow" must be overridden for the style extraction to work (with nth: 1, and not nth: 0)
                ? (shadows[0].length === 0 ? 'none' : shadows[0].join(','))
                : 'none',
            // drop shadow only
            filter: dontConvertShadow ? '' : shadows[0].map(shadowData => `drop-shadow(${shadowData})`).join(' '),
        })
    }
    const shapeComponentStyles = {
        height,
        width,
        position: 'fixed',
        left: Math.round(position[0]),
        top: Math.round(position[1]),
        zIndex: -1,
    }

    return <div {...props} style={divStyle} ref={div}>
        {pathIsEmpty ? null : <ShadowRoot>
            <div style={{
                ...shapeComponentStyles,
                clipPath: `path("${path}")`,
                // inset shadow only
                boxShadow: shadows[1].join(','),
                ...(Object.fromEntries(Object.keys(background).map(key => {
                    return [camelise(key === 'null' ? 'background' : ('background-' + key)), background[key]]
                }))),
            }}/>
            <svg viewBox={`0 0 ${width} ${height}`} style={shapeComponentStyles} preserveAspectRatio={'xMidYMid slice'}
                 ref={svgRef}>
                <defs>
                    <clipPath id="inner" clipPathUnits="userSpaceOnUse">
                        <path d={`M0,0V${height}H${width}V0Z` + innerPath} fillRule={'evenodd'}/>
                    </clipPath>
                    <clipPath id="outer" clipPathUnits="userSpaceOnUse">
                        <path d={path} fillRule={'evenodd'}/>
                    </clipPath>
                </defs>
                <g clipPath={'url(#outer)'}>
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
                </g>
            </svg>
            <slot style={{overflow: 'visible'}}/>
        </ShadowRoot>}
        {children}
    </div>
}
