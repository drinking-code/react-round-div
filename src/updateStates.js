import {
    convertBorderWidth,
    toNumber,
    separateInsetBoxShadow
} from './utils/css-utils';
import getAllCssPropertyDeclarationsForElement from './utils/styles-extractor';
import ReactDOM from 'react-dom'
import {lazySetArrayState, lazySetObjectsState} from './utils/react-utils'

export default function updateStates(args) {
    const {div, setHeight, setWidth} = args
    const boundingClientRect = div.current?.getBoundingClientRect()
    let height, width;
    if (boundingClientRect) {
        height = boundingClientRect.height
        width = boundingClientRect.width
        setHeight(height)
        setWidth(width)
    }

    const getNthStyle = (key, n, shorthand) => {
        const styles = getAllCssPropertyDeclarationsForElement(key, div.current, shorthand)
        return styles[n]?.declaration?.value
    }

    const getBorderRadii = (n) => ['top-left', 'top-right', 'bottom-right', 'bottom-left']
        .map(s => getNthStyle('border-' + s + '-radius', n, 'border-radius'))

    const states = args
    const lazySetRadius = newState => lazySetArrayState(states.setRadius, newState),
        lazySetBackground = newState => lazySetObjectsState(states.setBackground, newState),
        lazySetBorder = newState => lazySetObjectsState(states.setBorder, newState),
        lazySetBorderImage = newState => lazySetObjectsState(states.setBorderImage, newState),
        lazySetShadows = newState => lazySetArrayState(states.setShadows, newState)

    const oneIfStylesAreOverridden = args.div?.current?.dataset.rrdOverwritten === 'true' ? 1 : 0

    ReactDOM.unstable_batchedUpdates(() => {
        states.setPadding(
            ['top', 'right', 'bottom', 'left']
                .map(s => getNthStyle('padding-' + s, 0, 'padding'))
                .map(n => toNumber(n, div.current) || 0)
        )

        lazySetRadius(
            getBorderRadii(0)
                .map(s => Math.min(
                    toNumber(s, div.current),
                    height / 2,
                    width / 2
                ))
        )

        states.setTransition(
            getNthStyle('transition', 0)
        )

        states.setBoxSizing(
            getNthStyle('box-sizing', 0) || 'content-box'
        )

        lazySetBackground(
            Object.fromEntries([
                'attachment',
                'clip',
                'color',
                'image',
                'origin',
                'position',
                'repeat',
                'size'
            ].map(key =>
                [key, getNthStyle('background-' + key, oneIfStylesAreOverridden, 'background')]
            ))
        )

        const border = Object.fromEntries([
            'color',
            'style',
            'width',
        ].map(key =>
            [key, getNthStyle('border-' + key, oneIfStylesAreOverridden, 'border')]
        ))
        border.width = border.width?.split(' ')
            ?.map(s => convertBorderWidth(s, div.current))

        if (border.width?.length === 1)
            border.width = Array(4).fill(border.width[0])
        else if (border.width?.length === 2)
            border.width = border.width.concat(border.width)
        else if (border.width?.length === 3)
            border.width[4] = border.width[2]

        border.width = border.width ?? Array(4).fill(0)
        lazySetBorder(border)

        lazySetBorderImage(
            Object.fromEntries([
                'outset',
                'repeat',
                'slice',
                'source',
                'width',
            ].map(key =>
                [key, getNthStyle('border-image-' + key, oneIfStylesAreOverridden, 'border-image')]
            ))
        )

        lazySetShadows(
            separateInsetBoxShadow(
                getNthStyle('box-shadow', oneIfStylesAreOverridden)
            )
        )
    })
}
