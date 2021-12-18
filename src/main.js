import React, {useRef, useEffect, useState, useCallback} from 'react'
import generateSvgSquircle from './generator'
import './external/getMatchedCSSRules-polyfill'
import updateStates from "./updateStates"
import ShadowRoot from "./external/apearce:react-shadow-dom"
import attachCSSWatcher from './styleSheetWatcher'
import getMaskPaths from './mask-generator'

export default function RoundDiv({style, children, ...props}) {
    // welcome to react states hell
    const [position, setPosition] = useState([0, 0])
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(Array(4).fill(0))

    const [borderColor, setBorderColor] = useState(Array(4).fill('transparent'))
    const [borderOpacity, setBorderOpacity] = useState(Array(4).fill(0))
    const [borderWidth, setBorderWidth] = useState(Array(4).fill(0))

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
            setBorderColor,
            setBorderWidth,
            setBorderOpacity
        })
    }, [style])

    useEffect(updateStatesWithArgs, [style, updateStatesWithArgs])

    useEffect(() => {
        attachCSSWatcher(() => updateStatesWithArgs())
    }, [updateStatesWithArgs])

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

        // prevents unnecessary re-renders:
        // single value states (numbers and strings) prevent this out of the box,
        // complex states (objects, arrays, etc.) don't, so here it is manually for objects (non-nested)
        const lazySetObjectsState = (setState, newState) =>
            setState(oldState => {
                if (areEqualObjects(oldState, newState)) return oldState
                else return newState
            })

        function areEqualObjects(a, b) {
            if (Object.keys(a).length !== Object.keys(b).length) return false
            for (let key in a) {
                if (a[key] !== b[key]) return false
            }
            return true
        }

        lazySetObjectsState(setMaskPaths, getMaskPaths(borderWidth, height, width, radius))
    }, [height, width, radius, borderWidth])


    const divStyle = {
        ...style,
        clipPath: (path.startsWith('Z') || path === '') ? '' : `path("${path}")`,
        borderColor: 'transparent',
        borderRadius: 0,
    }

    return <div {...props} style={divStyle} ref={div}>
        <ShadowRoot>
            <svg viewBox={`0 0 ${width} ${height}`} style={{
                position: 'fixed',
                left: position[0],
                top: position[1],
                height,
                width,
                overflow: 'visible',
                zIndex: -1,
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
            <slot style={{overflow: 'visible'}}/>
        </ShadowRoot>
        {children}
    </div>
}
