import CSSRuleSet from '../internal/CSSProcessor.js'

const defaultFontSize = 12;
const defaultFontFamily = "'Roboto', sans-serif";
const buttonWidth = 80;
const input_and_button_borderBottomWidth = 2;
const inputHeight = 40;
const tablePadding = 5;
const width = 'var(--width)';
const themeColor = 'var(--theme-color)';
const borderRadius = 'var(--border-radius)';
const borderColor = 'darkgrey';
const transitionDuration = .5; //s

export default class {
    constructor(stylesRoot){
        const ruleSetsPrecached = (/** @return {Object<string, CSSRuleSet>} */ () => {
            const cache = Object.create(null);
            return new Proxy({}, {
                get: (_, s) => {
                    if(!cache[s]) cache[s] = new CSSRuleSet(s, stylesRoot);
                    return cache[s]
                }
            })
        })();

        const buttonSelector = 'input + a';
        const commentFirstRowSelector = 'tr:nth-child(odd)';
        const commentAvatarTdSelector = commentFirstRowSelector + ' > td:first-child';
        const commentSecondRowSelector = 'tr:nth-child(even)';

        const {
            '*': _all,
            table,
            td,
            a,
            input,
            [buttonSelector]: button,
            [buttonSelector + ' > span']: button_inner_span,
            [buttonSelector + '.disabled']: button_disabled,
            [buttonSelector + ':active']: button_click,
            '.input-and-button-wrapper': input_and_button_wrapper,
            [buttonSelector + ', input']: input_and_button,
            'input:focus': focused_input,
            [commentAvatarTdSelector]: avatar_td,
            [commentAvatarTdSelector + ' > img']: avatar,
            [commentSecondRowSelector + ' > td']: commentRow,
            'allbooms-icon': allboomsIcon,
        } = ruleSetsPrecached;

        _all.add({
            'font-size': defaultFontSize,
            'font-family': defaultFontFamily,
            'font-weight': 'normal', // normalize font display
        });

        input_and_button_wrapper.add({
            height: inputHeight + input_and_button_borderBottomWidth,
            position: 'relative',
            width: width,
        });

        input.add({
            height: 0,
            padding: inputHeight / 2,
            width: {
                ruleType: 'calc',
                firstArg: width,
                operator: '-',
                secondArg: buttonWidth + 'px'
            },
            'background-color': '#fff',
            color: 'black',
            'border-top-left-radius': borderRadius,
            position: 'absolute',
            'border-bottom': `${input_and_button_borderBottomWidth}px solid ${borderColor} !important`,
            border: 0,
        });

        focused_input.add({
            outline: 'none',
            'border-bottom-color': `${themeColor} !important`,
        });

        button.add({
            width: buttonWidth,
            padding: 0,
            'border-top-right-radius': borderRadius,
            height: inputHeight,
            'background-color': themeColor,
            color: '#fff',
            'font-weight': '700',
            display: 'inline-block',
            outline: 'none',
            position: 'relative',
            float: 'right',
            'text-align': 'center',
            'border-bottom': `${input_and_button_borderBottomWidth}px solid ${themeColor}`
        });

        button_inner_span.add({
            'font-weight': 'inherit',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            'white-space': 'nowrap',
        });

        button_disabled.add({
            'background-color': borderColor,
            'border-bottom-color': borderColor,
        });

        button_click.add({
            'background-color': '#fff',
            'border-bottom-color': '#fff',
            color: themeColor,
        });

        table.add({
            'background-color': '#fff',
            padding: tablePadding,
            'border-radius': borderRadius,
            'border-top-left-radius': 0,
            'border-top-right-radius': 0,
            width,
        });

        td.add({
            'line-height': '0.8em',
        });

        a.add({
            color: themeColor,
            'text-decoration': 'none',
        });

        avatar_td.add({
            width: 42,
            'vertical-align': 'top',
        });

        avatar.add({
            width: '100%',
            'border-radius': '50%',
        });

        commentRow.add({
            'line-height': '1em !important',
        });

        allboomsIcon.add({
            'font-size': 14,
        });

        setTimeout(() => input_and_button.add('transition', transitionDuration * 1000 + 'ms'), 100);

        return ruleSetsPrecached
    }
}
