/*
 * from https://github.com/apearce/react-shadow-root/blob/master/src/lib/ReactShadowRoot.js
 * by apearce
*/

import React, {Fragment} from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';

const constructableStylesheetsSupported = typeof window !== 'undefined' && window
    && window.ShadowRoot
    && window.ShadowRoot.prototype.hasOwnProperty('adoptedStyleSheets')
    && window.CSSStyleSheet
    && window.CSSStyleSheet.prototype.hasOwnProperty('replace');

const shadowRootSupported = typeof window !== 'undefined' && window
    && window.Element
    && window.Element.prototype.hasOwnProperty('attachShadow');

export default class ShadowRoot extends React.PureComponent {
    static constructableStylesheetsSupported = constructableStylesheetsSupported;
    static defaultProps = {
        delegatesFocus: false,
        mode: 'open'
    };
    static displayName = 'ReactShadowRoot';
    static propTypes = {
        delegatesFocus: PropTypes.bool,
        mode: PropTypes.oneOf(['open', 'closed']),
        stylesheets: PropTypes.arrayOf((propValue, idx, componentName, location, propFullName) => {
            if (!(propValue[idx] instanceof window.CSSStyleSheet)) {
                return new Error(
                    `Invalid prop \`${propFullName}\` supplied to \`${componentName}\`. Expected an instance of \`CSSStyleSheet\`.`
                );
            }
        })
    };
    static shadowRootSupported = shadowRootSupported;

    state = { initialized: false };

    constructor() {
        super();
        this.placeholder = React.createRef();
    }

    componentDidMount() {
        const {
            delegatesFocus,
            mode,
            stylesheets
        } = this.props;

        this.shadowRoot = this.placeholder.current.parentNode.attachShadow({
            delegatesFocus,
            mode
        });

        if (stylesheets) {
            this.shadowRoot.adoptedStyleSheets = stylesheets;
        }

        this.setState({
            initialized: true
        });
    }

    render() {
        if (!this.state.initialized) {
            return <span ref={this.placeholder}/>;
        }

        return ReactDOM.createPortal(this.props.children, this.shadowRoot);
    }
}
