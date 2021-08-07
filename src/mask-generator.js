export default function getMaskPaths(borderWidth, height, width) {
    const n = 10;
    // todo: make adaptive

    const maskPointsA = {
        to: -borderWidth[0],
        ti: borderWidth[0] * n,
        ro: width + borderWidth[1],
        ri: width - borderWidth[1] * n,
        bo: height + borderWidth[2],
        bi: height - borderWidth[2] * n,
        lo: -borderWidth[3],
        li: borderWidth[3] * n,
    }

    const maskPoints = {
        tlo: maskPointsA.lo + ',' + maskPointsA.to,
        tli: maskPointsA.li + ',' + maskPointsA.ti,
        tro: maskPointsA.ro + ',' + maskPointsA.to,
        tri: maskPointsA.ri + ',' + maskPointsA.ti,
        blo: maskPointsA.lo + ',' + maskPointsA.bo,
        bli: maskPointsA.li + ',' + maskPointsA.bi,
        bro: maskPointsA.ro + ',' + maskPointsA.bo,
        bri: maskPointsA.ri + ',' + maskPointsA.bi,
    }

    return {
        top: `M${maskPoints.tli}H${maskPointsA.ri}L${maskPoints.tro}H${maskPointsA.lo}Z`,
        right: `M${maskPoints.tri}V${maskPointsA.bi}L${maskPoints.bro}V${maskPointsA.to}Z`,
        bottom: `M${maskPoints.bri}H${maskPointsA.li}L${maskPoints.blo}H${maskPointsA.ro}Z`,
        left: `M${maskPoints.bli}V${maskPointsA.ti}L${maskPoints.tlo}V${maskPointsA.bo}Z`,
    }
}
