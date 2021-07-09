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

    const [background, setBackground] = useState('transparent')
    const [backgroundImage, setBackgroundImage] = useState('none')
    // todo: background size two values (from css)
    const [backgroundImageSize, setBackgroundImageSize] = useState([null, null])
    const [backgroundPosition, setBackgroundPosition] = useState([0, 0])
    const [backgroundOpacity, setBackgroundOpacity] = useState(0)
    const [backgroundRepeat, setBackgroundRepeat] = useState(['repeat', 'repeat'])

    const [borderColor, setBorderColor] = useState('transparent')
    const [borderWidth, setBorderWidth] = useState(0)
    const [borderOpacity, setBorderOpacity] = useState(1)

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
        setBackground,
        setBackgroundImage,
        setBackgroundImageSize,
        setBackgroundPosition,
        setBackgroundOpacity,
        setBackgroundRepeat,
        setBorderColor,
        setBorderWidth,
        setBorderOpacity
    }), [style])

    useEffect(updateStatesWithArgs, [div, clip, style, updateStatesWithArgs])

    useEffect(() => {
        attachCSSWatcher(() => updateStatesWithArgs())
    }, [updateStatesWithArgs])

    const divStyle = {
        ...style
    }

    divStyle.background = 'transparent'
    divStyle.borderWidth = '0'
    divStyle.borderColor = 'transparent'

    const [backgroundImageAspectRatio, setBackgroundImageAspectRatio] = useState(1)
    // const [backgroundImageHeight, setBackgroundImageHeight] = useState(0)
    // const [backgroundImageWidth, setBackgroundImageWidth] = useState(0)
    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            setBackgroundImageAspectRatio(img.naturalWidth / img.naturalHeight)
            // setBackgroundImageHeight(img.naturalHeight)
            // setBackgroundImageWidth(img.naturalWidth)
        }
        img.src = backgroundImage
    }, [backgroundImage, setBackgroundImageAspectRatio])

    const fullHeight = height + borderWidth * 2,
        fullWidth = width + borderWidth * 2

    const lengthCalculator = (isWidth) => {
        let n = isWidth ? 0 : 1

        if (backgroundImageSize[0] === 'contain')
            if (backgroundImageAspectRatio > 1)
                return isWidth ? width : (height / backgroundImageAspectRatio)
            else
                return isWidth ? (width * backgroundImageAspectRatio) : height

        if (['cover', 'contain'].includes(backgroundImageSize[0]))
            return isWidth ? width : height

        if (backgroundImageSize[n] === null && !!backgroundImageSize[0])
            return lengthCalculator(true) *
                (backgroundImageAspectRatio < 1
                    ? 1 / backgroundImageAspectRatio
                    : backgroundImageAspectRatio
                )

        if (!backgroundImageSize[n])
            return undefined

        if (backgroundImageSize[n]?.endsWith('%'))
            return width * (Number(backgroundImageSize[n].replace('%', '')) / 100)

        if (typeof backgroundImageSize[n] === 'number')
            return backgroundImageSize[n]
    }

    const imageHeight = lengthCalculator(false),
        imageWidth = lengthCalculator(true),
        preserveImageAspectRatio = (
            ['cover', 'contain'].includes(backgroundImageSize[0])
        )

    return <div {...props} style={divStyle} ref={div}>
        <ShadowRoot>
            <svg viewBox={`0 0 ${width} ${height}`} style={{
                position: 'absolute',
                height,
                width: 1,
                overflow: 'visible',
                zIndex: -1
            }} xmlnsXlink="http://www.w3.org/1999/xlink" preserveAspectRatio={'xMidYMid slice'}>
                <defs>
                    <path d={
                        generateSvgSquircle(fullHeight, fullWidth, radius, clip)
                    } id="shape"/>
                    {/* todo: support for "repeat: space" and "repeat: round" */}
                    <pattern id="bg" patternUnits="userSpaceOnUse"
                             width={backgroundRepeat[0] === 'no-repeat' ? fullWidth : imageWidth}
                             height={backgroundRepeat[1] === 'no-repeat' ? fullHeight : imageHeight}
                             x={borderWidth} y={borderWidth}>
                        <image href={backgroundImage}
                               preserveAspectRatio={preserveImageAspectRatio ? 'xMinYMin ' + (
                                   backgroundImageSize[0] === 'contain' || backgroundImageSize[0]?.endsWith('%')
                                       ? 'meet'
                                       : 'slice'
                               ) : 'none'}
                               height={imageHeight}
                               width={imageWidth}/>
                    </pattern>

                    <clipPath id="insideOnly">
                        <use xlinkHref="#shape" fill="black"/>
                    </clipPath>
                </defs>
                <use xlinkHref="#shape" fill={backgroundImage !== 'none' ? 'url(#bg)' : background}
                     opacity={backgroundOpacity} x={-borderWidth} y={-borderWidth}/>
                <use xlinkHref="#shape" stroke={borderColor} fill="none" strokeWidth={borderWidth * 2}
                     opacity={borderOpacity} clipPath="url(#insideOnly)" x={-borderWidth} y={-borderWidth}/>
            </svg>
            <slot/>
        </ShadowRoot>
        {children}
    </div>
}
