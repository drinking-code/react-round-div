import * as specificity from 'specificity'
import css from 'css'

export default function getAllCssPropertyDeclarationsForElement(targetProperty, targetElement, targetPropertyShorthand) {
    const allCssRules = []

    const debug = (...args) => /*targetProperty === 'background-image' ? console.log(...args) :*/ 0;

    if (targetElement.style[targetProperty] !== '') {
        allCssRules.push({
            position: 0,
            specificity: [1, 0, 0, 0],
            declaration: {
                type: 'declaration',
                property: targetProperty,
                value: targetElement.style[targetProperty],
            }
        })
    } else if (targetPropertyShorthand && targetElement.style[targetPropertyShorthand] !== '') {
        allCssRules.push({
            position: 0,
            specificity: [1, 0, 0, 0],
            declaration: {
                type: 'declaration',
                property: targetProperty,
                value: parseCssShorthand(
                    targetPropertyShorthand,
                    targetElement.style[targetPropertyShorthand]
                )[targetProperty],
            }
        })
    }

    for (let index in document.styleSheets) {
        if (!document.styleSheets.hasOwnProperty(index)) continue
        const styleSheet = document.styleSheets.item(Number(index))
        if (styleSheet.disabled) continue
        for (let index in styleSheet.cssRules) {
            if (!styleSheet.cssRules.hasOwnProperty(index)) continue
            const rule = styleSheet.cssRules.item(Number(index))
            try {
                if (!rule.selectorText || !targetElement.matches(rule.selectorText)) continue
            } catch (e) {
                continue
            }
            rule.cssParsed = css.parse(rule.cssText)?.stylesheet?.rules[0]?.declarations
            if (!rule.cssParsed) continue
            let foundDeclaration = rule.cssParsed.find(dec => dec.property === targetProperty)
            const foundShorthandDeclaration = rule.cssParsed.find(dec => dec.property === targetPropertyShorthand)
            if (!foundDeclaration && !foundShorthandDeclaration) continue
            debug(foundShorthandDeclaration, foundDeclaration)
            if (foundShorthandDeclaration && !foundDeclaration)
                foundDeclaration = {
                    type: 'declaration',
                    property: targetProperty,
                    value: parseCssShorthand(
                        targetPropertyShorthand,
                        foundShorthandDeclaration.value
                    )[targetProperty],
                }
            allCssRules.push({
                position: allCssRules.length,
                specificity: specificity.calculate(rule.selectorText)[0].specificityArray,
                declaration: foundDeclaration
            })
        }
    }

    debug(allCssRules)

    function isImportant(declarationValue) {
        return /!important/.test(declarationValue)
    }

    allCssRules.sort((a, b) => {
        // important styles override non-important styles
        const aIsImportant = isImportant(a.declaration.value)
        const bIsImportant = isImportant(b.declaration.value)
        if (aIsImportant && !bIsImportant) return -1
        else if (!aIsImportant && bIsImportant) return 1

        // sort by specificity
        const specificityDifference = specificity.compare(a.specificity, b.specificity)
        if (specificityDifference !== 0) return -specificityDifference

        // sort by position if specificity is the same
        return a.position - b.position
    })

    return allCssRules
}

function parseCssShorthand(property, value) {
    const el = document.createElement('div')
    el.setAttribute('style', `${property}: ${value};`)
    return el.style
}
