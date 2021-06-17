export default function generateSvgSquircle(height, width, radius, clip) {
    /* from right to left top left corner upper (right half) */
    const ratios = [1.528665037, 1.0884928889, 0.8684068148, 0.07491140741, 0.6314939259, 0.1690595556, 0.3728238519];

    height = Number(height);
    width = Number(width);

    radius = clip === false
        ? Number(radius)
        : Math.min(Number(radius), height / 2, width / 2);

    const [a0x, a1x, a2x, a3y, a3x, b1y, b1x] = Array(7).fill(0).map((a, i) => radius * ratios[i]),
        [b0y, b0x] = [a3y, a3x]

    if (isNaN(height)) throw new Error(`'height' must be a number`);
    if (isNaN(width)) throw new Error(`'width' must be a number`);
    if (isNaN(radius)) throw new Error(`'radius' must be a number`);

    const a0xF = x => Math.min(x / 2, a0x),
        a0xw = a0xF(width),
        a0xh = a0xF(height)

    function mapRange(number, in_min, in_max, out_min, out_max) {
        return (number - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    const yOffsetF = (x) =>
        Math.max(0, Math.min(
            mapRange(radius, (x / 2) * .90, x / 2, 0, 1),
            1
        )) * 1.7,
        hyOffset = clip !== false ? yOffsetF(height) : 0,
        wyOffset = clip !== false ? yOffsetF(width) : 0

    const startPoint = `${a0xw},${wyOffset}`

    return `M${startPoint}
    ${width / 2 < a0x && clip !== false
        ? ''
        : `L${width - a0xw},0`
    }
    
    C${width - a1x},0,${width - a2x},0,${width - a3x},${a3y}
    C${width - b1x},${b1y},${width - b1y},${b1x},${width - b0y},${b0x}
    C${width},${a2x},${width},${a1x},
    
    ${width - hyOffset},${a0xh}
    ${height / 2 < a0x && clip !== false
        ? ''
        : `L${width},${height - a0xh}`
    }
    
    C${width},${height - a1x},${width},${height - a2x},${width - a3y},${height - a3x}
    C${width - b1y},${height - b1x},${width - b1x},${height - b1y},${width - b0x},${height - b0y}
    C${width - a2x},${height},${width - a1x},${height},
    
    ${width - a0xw},${height - wyOffset}
    ${width / 2 < a0x && clip !== false
        ? ''
        : `L${a0xw},${height}`
    }
    
    C${a1x},${height},${a2x},${height},${a3x},${height - a3y}
    C${b1x},${height - b1y},${b1y},${height - b1x},${b0y},${height - b0x}
    C0,${height - a2x},0,${height - a1x},
    
    ${hyOffset},${height - a0xh}
    ${height / 2 < a0x && clip !== false
        ? ''
        : `L0,${a0xh}`
    }
    
    C0,${a1x},0,${a2x},${a3y},${a3x}
    C${b1y},${b1x},${b1x},${b1y},${b0x},${b0y}
    C${a2x},0,${a1x},0,${startPoint}
    Z`.replace(/\n */g, '');
}
