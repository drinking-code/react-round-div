import * as specificity from 'specificity'
import css from 'css'
import {iterateAllCssRules} from './css-utils'

export default function getAllCssPropertyDeclarationsForElement(targetProperty, targetElement, targetPropertyShorthand) {
    const allCssRules = []

    const typicalDeclaration = {
        type: 'declaration',
        property: targetProperty,
    }

    const makeFirstInlineRule = value => {
        return {
            position: 0,
            specificity: [1, 0, 0, 0],
            declaration: {
                ...typicalDeclaration,
                value: value,
            }
        }
    }

    if (targetElement.style[targetProperty] !== '') {
        allCssRules.push(
            makeFirstInlineRule(targetElement.style[targetProperty])
        )
    } else if (targetPropertyShorthand && targetElement.style[targetPropertyShorthand] !== '') {
        allCssRules.push(
            makeFirstInlineRule(
                parseCssShorthand(
                    targetPropertyShorthand,
                    targetElement.style[targetPropertyShorthand]
                )[targetProperty]
            )
        )
    }

    iterateAllCssRules(rule => {
        try {
            if (!rule.selectorText || !targetElement.matches(rule.selectorText)) return
        } catch (e) {
            return
        }
        if (!rule.cssParsed)
            rule.cssParsed = css.parse(rule.cssText)?.stylesheet?.rules[0]?.declarations
        if (!rule.cssParsed) return
        let foundDeclaration = rule.cssParsed.find(dec => dec.property === targetProperty)
        const foundShorthandDeclaration = rule.cssParsed.find(dec => dec.property === targetPropertyShorthand)
        if (!foundDeclaration && !foundShorthandDeclaration) return
        if (foundShorthandDeclaration && !foundDeclaration)
            foundDeclaration = {
                ...typicalDeclaration,
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
    })

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
