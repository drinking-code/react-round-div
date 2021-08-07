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

    if (typeof radius === 'number')
        radius = Array(4).fill(radius)
    else if (radius.length === 2)
        radius.push(radius[0])
    if (radius.length === 3)
        radius.push(radius[1])

    height = Number(height);
    width = Number(width);

    radius = radius.map(radius => Math.min(Number(radius), height / 2, width / 2))

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

    function mapRange(number, in_min, in_max, out_min, out_max) {
        return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    const maxRadius = Math.max(...radius);

    const yOffsetF = (x) =>
        Math.max(0, Math.min(
            mapRange(maxRadius, (x / 2) * .90, x / 2, 0, 1),
            1
        )) * 200 / maxRadius,
        hyOffset = yOffsetF(height),
        wyOffset = yOffsetF(width)

    console.log(hyOffset, wyOffset)

    const startPoint = `${a0xw},${wyOffset}`

    return `M${startPoint}
    ${width / 2 < a0x[1]
        ? ''
        : `L${width - a0xw},0`
    }
    
    C${width - a1x[1]},0,${width - a2x[1]},0,${width - a3x[1]},${a3y[1]}
    C${width - b1x[1]},${b1y[1]},${width - b1y[1]},${b1x[1]},${width - b0y[1]},${b0x[1]}
    C${width},${a2x[1]},${width},${a1x[1]},
    
    ${width - hyOffset},${a0xh}
    ${height / 2 < a0x[2]
        ? ''
        : `L${width},${height - a0xh}`
    }
    
    C${width},${height - a1x[2]},${width},${height - a2x[2]},${width - a3y[2]},${height - a3x[2]}
    C${width - b1y[2]},${height - b1x[2]},${width - b1x[2]},${height - b1y[2]},${width - b0x[2]},${height - b0y[2]}
    C${width - a2x[2]},${height},${width - a1x[2]},${height},
    
    ${width - a0xw},${height - wyOffset}
    ${width / 2 < a0x[3]
        ? ''
        : `L${a0xw},${height}`
    }
    
    C${a1x[3]},${height},${a2x[3]},${height},${a3x[3]},${height - a3y[3]}
    C${b1x[3]},${height - b1y[3]},${b1y[3]},${height - b1x[3]},${b0y[3]},${height - b0x[3]}
    C0,${height - a2x[3]},0,${height - a1x[3]},
    
    ${hyOffset},${height - a0xh}
    ${height / 2 < a0x[0]
        ? ''
        : `L0,${a0xh}`
    }
    
    C0,${a1x[0]},0,${a2x[0]},${a3y[0]},${a3x[0]}
    C${b1y[0]},${b1x[0]},${b1x[0]},${b1y[0]},${b0x[0]},${b0y[0]}
    C${a2x[0]},0,${a1x[0]},0,${startPoint}
    Z`.replace(/\n */g, '');
}
