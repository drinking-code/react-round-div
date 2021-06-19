import React, {useRef, useEffect, useState, useCallback} from 'react'
import generateSvgSquircle from './generator'
import './getMatchedCSSRules-polyfill'
import updateStates from "./updateStates"
import ShadowRoot from "./react-shadow-dom"
import attachCSSWatcher from './style-sheet-watcher'

export default function RoundDiv({clip, style, children, ...props}) {
    const [height, setHeight] = useState(0)
    const [width, setWidth] = useState(0)
    const [radius, setRadius] = useState(0)
    const [background, setBackground] = useState('transparent')
    const [backgroundImage, setBackgroundImage] = useState('none')
    const [backgroundImageSize, setBackgroundImageSize] = useState(null)
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

    const updateStatesWithArgs = useCallback(() => updateStates({
        div,
        style,
        setHeight,
        setWidth,
        setRadius,
        setBackground,
        setBackgroundImage,
        setBackgroundImageSize,
        setBackgroundOpacity,
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
    const [backgroundImageHeight, setBackgroundImageHeight] = useState(0)
    const [backgroundImageWidth, setBackgroundImageWidth] = useState(0)
    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            setBackgroundImageAspectRatio(img.naturalWidth / img.naturalHeight)
            setBackgroundImageHeight(img.naturalHeight)
            setBackgroundImageWidth(img.naturalWidth)
        }
        img.src = backgroundImage
    }, [backgroundImage, setBackgroundImageAspectRatio])

    const fullHeight = height + borderWidth * 2,
        fullWidth = width + borderWidth * 2

    console.log(backgroundImageSize)

    const lengthCalculator = (isWidth) => {
        if ((!isWidth && backgroundImageAspectRatio > 1)
            || (isWidth && backgroundImageAspectRatio < 1)
            || !backgroundImageSize
        ) return undefined

        if (typeof backgroundImageSize === 'number')
            return backgroundImageSize

        if (['cover', 'contain'].includes(backgroundImageSize))
            return fullHeight

        if (backgroundImageSize.endsWith('%'))
            return (isWidth ? fullWidth : fullHeight)
                * (Number(backgroundImageSize.replace('%', '')) / 100)
    }

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

                    <pattern id="bg" patternUnits="userSpaceOnUse"
                             width={fullWidth} height={fullHeight}>
                        <image href={backgroundImage} x={borderWidth} y={borderWidth}
                               preserveAspectRatio={'xMinYMin ' + (backgroundImageSize === 'contain' ? 'meet' : 'slice')}
                               height={lengthCalculator(false)}
                               width={lengthCalculator(true)}/>
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
