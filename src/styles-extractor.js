function getInherited(element, s, value) {
    while (element.parentNode && window.getComputedStyle(element.parentNode)[s] === value) {
        element = element.parentNode;
    }

    if (element) {
        return getStyle(s, element).current;
    } else {
        return null;
    }
}

function isImportant(s, style, text) {
    return new RegExp(s.replace(/([A-Z])/g, '-$1').toLowerCase() + ':\\s+' + style + '\\s+!important').test(text)
}

function getStyle(key, element) {
    const css = window.getMatchedCSSRules(element),
        style = window.getComputedStyle(element),
        value = style[key],
        styles = [],
        rules = []
    let inherited, currentRule;

    if (value) {

        if (css) {
            for (let i = 0; i < css.length; i++) {
                styles.push(css[i]);
            }
        }

        styles.push({
            style: element.style,
            cssText: 'element.style {' + element.getAttribute('style') + ' }'
        });

        for (let i = styles.length - 1; i >= 0; i--) {
            const def = styles[i],
                rule = {
                    index: rules.length,
                    style: key,
                    value: styles[i].style[key],
                    cssText: def.cssText
                };

            if (rule.value === 'inherit' && !currentRule) {
                // eslint-disable-next-line no-cond-assign
                if (inherited = getInherited(element, key, value)) {
                    rule.inheritedFrom = inherited;
                    currentRule = rule;
                    inherited = undefined;
                } else {
                    rules.push(rule);
                }
            } else if (rule.value === 'inherit' && currentRule && isImportant(key, value, def.cssText)) {
                // eslint-disable-next-line no-cond-assign
                if (inherited = getInherited(element, key, def)) {
                    rule.inheritedFrom = inherited;
                    rules.splice(currentRule.index, 0, currentRule);
                    currentRule = rule;
                    inherited = undefined;
                } else {
                    rules.push(rule);
                }
            } else if (rule.value === value && !currentRule) {
                currentRule = rule;
            } else if (rule.value === value && currentRule && isImportant(key, value, def.cssText)) {
                rules.splice(currentRule.index, 0, currentRule);
                currentRule = rule;
            } else if (rule.value.length) {
                rules.push(rule)
            }
        }

        return {
            current: currentRule,
            overwritten: rules
        };

    } else {
        return false;
    }
}

export default getStyle
