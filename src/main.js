import React, {useRef, useEffect, useState} from 'react'

const ShadowRoot = typeof window !== 'undefined' ? require('react-shadow-root').default : () => 0

import generateSvgSquircle from './generator'
import {attachCSSWatcher, detachCSSWatcher} from './styleSheetWatcher'
import updateStates from './updateStates'

import {camelise} from './utils/string-manipulation'

/**
 * @function RoundDiv
 * @extends React.PureComponent
 * */
export default function RoundDiv({style, children, dontConvertShadow, ...props}) {
    const array = (length, defaultValue) => Array(length).fill(defaultValue)
    // welcome to react states hell
    const [padding, setPadding] = useState(array(4, 0))
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(array(4, 0))

    const [transition, setTransition] = useState(array(4, 0))

    const [background, setBackground] = useState({})
    const [border, setBorder] = useState({width: array(4, 0)})
    const [borderImage, setBorderImage] = useState({})
    // const [borderColor, setBorderColor] = useState(array(4, 'transparent'))
    // const [borderOpacity, setBorderOpacity] = useState(array(4, 0))
    // const [borderWidth, setBorderWidth] = useState(array(4, 0))
    const [shadows, setShadows] = useState(array(2, []))

    const [path, setPath] = useState('Z')
    const [innerPath, setInnerPath] = useState('Z')

    const div = useRef()

    const updateStatesWithArgs = () => {
        updateStates({
            div,
            style,
            setPadding,
            setHeight,
            setWidth,
            setRadius,
            setBackground,
            setBorder,
            setBorderImage,
            setShadows,
            setTransition,
        })
    }

    useEffect(() => {
        const watcherId = attachCSSWatcher(updateStatesWithArgs, div.current) // todo: make this a react hook
        updateStatesWithArgs()
        return () => {
            detachCSSWatcher(watcherId)
        }
    }, [])

    const svgRef = useRef();

    useEffect(() => {
        setInnerPath(generateSvgSquircle(
            height - (border.width[0] + border.width[2]),
            width - (border.width[1] + border.width[3]),
            radius.map((val, i) =>
                Math.max(0,
                    val - Math.max(border.width[i], border.width[i === 0 ? 3 : i - 1])
                )
            )
        ).replace(
            /(\d+(\.\d+)?),(\d+(\.\d+)?)/g,
            match => match.split(',').map((number, i) =>
                Number(number) + (i === 0 ? border.width[3] : border.width[0])
            ).join(',')
        ))
        setPath(generateSvgSquircle(height, width, radius))
    }, [height, width, radius, border.width])

    useEffect(() => {
        // patch for webkit's svg bug
        if (svgRef.current)
            setTimeout(() => {
                const oldPosition = svgRef.current.style.position || ''
                svgRef.current.style.display = 'none'
                svgRef.current.style.position = 'absolute'
                setTimeout(() => {
                    svgRef.current.style.display = ''
                    svgRef.current.style.position = oldPosition
                }, 10)
            }, 0)
    }, [radius, border, borderImage])

    const pathIsEmpty = (path.startsWith('Z') || path === '')
    const divStyle = {
        ...style,
        ...(pathIsEmpty ? {} : {
            border: 'none',
            borderImage: 'none',
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
        left: 0,
        top: 0,
        transform: `translate(-${padding[3] + border.width[3]}px, -${padding[0] + border.width[0]}px)`,
        zIndex: -1,
    }

    const widenedBorderWidth = border.width.map(v => v + Math.max(.5, v * .1))

    return <div {...props} style={divStyle} ref={div}>
        {pathIsEmpty ? null : <ShadowRoot>
            <div style={{
                transform: 'scale(1)'
            }}>
                <div style={{
                    ...shapeComponentStyles,
                    clipPath: `path("${path}")`,
                    // inset shadow only
                    boxShadow: shadows[1].join(','),
                    borderRadius: radius.map(n => (n - 1) + 'px').join(' '),
                    ...(Object.fromEntries(Object.keys(background).map(key => {
                        return [camelise(key === 'null' ? 'background' : ('background-' + key)), background[key]]
                    }))),
                    transition,
                }}/>
                <div style={{
                    ...shapeComponentStyles,
                    clipPath: `path("${path}")`
                }}>
                    <div style={{
                        height: height - (widenedBorderWidth[0] + widenedBorderWidth[2]),
                        width: width - (widenedBorderWidth[1] + widenedBorderWidth[3]),
                        clipPath: `path("M0,0V${height}H${width}V0Z${innerPath}")`,
                        borderRadius: radius.map(n => (n - 1) + 'px').join(' '),
                        borderColor: border.color,
                        borderWidth: widenedBorderWidth.map(v => v + 'px').join(' '),
                        borderStyle: border.style,
                        ...(Object.fromEntries(Object.keys(borderImage).map(key => {
                            return [
                                camelise('border-image-' + key),
                                borderImage[key] + (key === 'slice' ? ' fill' : '')
                            ]
                        }))),
                        transition,
                    }}/>
                </div>
                <slot style={{overflow: 'visible'}}/>
            </div>
        </ShadowRoot>}
        {children}
    </div>
}
