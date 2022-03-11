export function areEqualObjects(a, b) {
    if (Object.keys(a).length !== Object.keys(b).length) return false
    for (let key in a) {
        if (a[key] !== b[key]) return false
    }
    return true
}
