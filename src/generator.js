/**
 * @param {number} height
 * @param {number} width
 * @param {number | Array<number>} radius
 *
 * @returns {string} SVG path data
 * */
export default function generateSvgSquircle(height, width, radius) {
    /* from right to left top left corner upper (right half) */
    const ratios = [1.528665037, 1.0884928889, 0.8684068148, 0.07491140741, 0.6314939259, 0.1690595556, 0.3728238519];
    const roundToNthPlace = 1;

    if (typeof radius === 'number')
        radius = Array(4).fill(radius)
    else if (radius.length === 2)
        radius.push(radius[0])
    if (radius.length === 3)
        radius.push(radius[1])

    height = Number(height);
    width = Number(width);

    const _rawRadius = [...radius].map(n => Number(n))
    const max = radius.length - 1
    const next = i => i === max ? 0 : i + 1
    const prev = i => i === 0 ? max : i - 1
    radius = _rawRadius.map((radius, i) =>
        Math.min(
            radius,
            Math.min(
                height - _rawRadius[i % 2 === 0 ? prev(i) : next(i)],
                height / 2
            ),
            Math.min(
                width - _rawRadius[i % 2 === 0 ? next(i) : prev(i)],
                width / 2
            )
        )
    )

    const [a0x, a1x, a2x, a3y, a3x, b1y, b1x] = Array(7)
            .fill(Array(4).fill(0))
            .map((a, i) => a.map((b, j) => radius[j] * ratios[i])),
        [b0y, b0x] = [a3y, a3x]

    if (isNaN(height)) throw new Error(`'height' must be a number`);
    if (isNaN(width)) throw new Error(`'width' must be a number`);
    if (radius.includes(NaN)) throw new Error(`'radius' must be a number or an array containing 2 to 4 numbers`);

    const a0xF = x => Math.min(x / 2, a0x[0]),
        a0xw = a0xF(width),
        a0xh = a0xF(height)

    function mapRange(number, inMin, inMax, outMin, outMax) {
        return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    function clip(number, min, max) {
        return Math.max(min, Math.min(number, max))
    }

    const yOffsetF = (r1, r2, l) => {
        if (r1 + r2 < l)
            return 0
        else {
            const maximumStraightLengthRatio = 1 / 6
            const straightLength = l - (r1 + r2)
            const straightLengthRatio = straightLength / l
            const clippedStraightLengthRatio = clip(straightLengthRatio, 0, maximumStraightLengthRatio)
            const reversedClippedStraightLengthRatio = mapRange(clippedStraightLengthRatio, 0, maximumStraightLengthRatio, maximumStraightLengthRatio, 0)
            return reversedClippedStraightLengthRatio * l / 14
        }
    }
    const topYOffset = yOffsetF(radius[1], radius[2], width) || 0
    const rightYOffset = yOffsetF(radius[2], radius[3], height) || 0
    const bottomYOffset = yOffsetF(radius[3], radius[0], width) || 0
    const leftYOffset = yOffsetF(radius[0], radius[1], height) || 0

    const startPoint = `${a0xw},${topYOffset}`

    const path = `M${startPoint}
    ${width / 2 < a0x[2]
        ? ''
        : `L${width - a0xw},0`
    }
    
    C${width - a1x[2]},0,${width - a2x[2]},0,${width - a3x[2]},${a3y[2]}
    C${width - b1x[2]},${b1y[2]},${width - b1y[2]},${b1x[2]},${width - b0y[2]},${b0x[2]}
    C${width},${a2x[2]},${width},${a1x[2]},
    
    ${width - rightYOffset},${a0xh}
    ${height / 2 < a0x[3]
        ? ''
        : `L${width},${height - a0xh}`
    }
    
    C${width},${height - a1x[3]},${width},${height - a2x[3]},${width - a3y[3]},${height - a3x[3]}
    C${width - b1y[3]},${height - b1x[3]},${width - b1x[3]},${height - b1y[3]},${width - b0x[3]},${height - b0y[3]}
    C${width - a2x[3]},${height},${width - a1x[3]},${height},
    
    ${width - a0xw},${height - bottomYOffset}
    ${width / 2 < a0x[0]
        ? ''
        : `L${a0xw},${height}`
    }
    
    C${a1x[0]},${height},${a2x[0]},${height},${a3x[0]},${height - a3y[0]}
    C${b1x[0]},${height - b1y[0]},${b1y[0]},${height - b1x[0]},${b0y[0]},${height - b0x[0]}
    C0,${height - a2x[0]},0,${height - a1x[0]},
    
    ${leftYOffset},${height - a0xh}
    ${height / 2 < a0x[1]
        ? ''
        : `L0,${a0xh}`
    }
    
    C0,${a1x[1]},0,${a2x[1]},${a3y[1]},${a3x[1]}
    C${b1y[1]},${b1x[1]},${b1x[1]},${b1y[1]},${b0x[1]},${b0y[1]}
    C${a2x[1]},0,${a1x[1]},0,${startPoint}
    Z`
        .replace(/[\n ]/g, '')
        .replace(/NaN/g, '0')
        .replace(/\d+\.\d+/g, match =>
            Math.round(Number(match) * (10 ** roundToNthPlace)) / (10 ** roundToNthPlace)
        )

    if (path.match(/[^ M0LCZ,]/) === null)
        return ''

    return path
}
