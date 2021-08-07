export default function getMaskPaths(borderWidth, height, width) {
    const allSides = ['top', 'right', 'bottom', 'left']
    const max = allSides.length - 1
    const next = i => i === max ? 0 : i + 1
    const prev = i => i === 0 ? max : i - 1

    /**
     * @constant
     * @type {Array<number>}
     * */
    const allRatios = allSides.map((side, i) =>
        ((i % 2 === 0 ? height : width) - borderWidth[next(next(i))])
        / borderWidth[i]
    )

    /**
     * @param {string} posY
     * @param {string} posX
     * @param {boolean} [inside]
     * @param {string} [borderPos] needed if inside=true
     * */
    const makePoint = (posY, posX, inside, borderPos) => {
        return makeValue(posX, inside, borderPos) + ',' + makeValue(posY, inside, borderPos)
    }

    /**
     * @param {string} pos
     * @param {boolean} [inside]
     * @param {string} [borderPos] needed if inside=true
     * */
    const makeValue = (pos, inside, borderPos) => {
        let v = -borderWidth[allSides.indexOf(pos)]

        if (inside) {
            const i = allSides.indexOf(borderPos)
            v *= -Math.min(allRatios[prev(i)], allRatios[i], allRatios[next(i)])
        }

        if (pos === 'right')
            v = -v + Number(width)
        else if (pos === 'bottom')
            v = -v + Number(height)

        return v
    }

    const makeMaskPath = (side) => {
        const i = allSides.indexOf(side)
        const isH = i % 2 === 0 // is "top" or "bottom"
        const T = isH ? 'H' : 'V'
        const nextSide = allSides[next(i)]
        const prevSide = allSides[prev(i)]
        const prevIfH = isH ? prevSide : side
        const prevIfV = !isH ? prevSide : side
        const nextIfH = isH ? nextSide : side
        const nextIfV = !isH ? nextSide : side

        return 'M' + makePoint(prevIfV, prevIfH, true, side) +
            T + makeValue(nextSide, true, side) +
            'L' + makePoint(nextIfV, nextIfH) +
            T + makeValue(prevSide) + 'Z'
    }

    return Object.fromEntries(
        allSides.map(side => [side, makeMaskPath(side)])
    )
}
