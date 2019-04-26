import CSSRuleSet from '../internal/CSSProcessor.js'

const defaultFontSize = 12;
const defaultFontFamily = "'Roboto', sans-serif";
const buttonWidth = 44;
const input_and_button_borderBottomWidth = 2;
const tablePadding = 5;
const width = 'var(--width)';
const themeColor = 'var(--theme-color)';
const borderRadius = 'var(--border-radius)';
const borderColor = 'darkgrey';
const transitionDuration = .5; //s
const avatarWidthHeight = 42;
const height = 'var(--height)';
const childCenterBlockPreset = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
};
const inputHeight = 'var(--input-height)';
const inputPadding = Object.assign(12, { left: 20 });

function generageSquareProp(name, initialVal, ...excluded){
    const res = {};
    ['top', 'bottom', 'left', 'right'].forEach(s => res[`${name}-${s}`] = initialVal);
    for(var i = 0; i < excluded.length; i += 2) res[`${name}-${excluded[i]}`] = excluded[i + 1];
    return res
}

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

        const inputSelector = 'div[contentEditable]';
        const placeholderSelector = inputSelector + ' + div';
        const buttonSelector = placeholderSelector + ' + a';
        const tableSelector = '.comments-wrapper';
        const commentSelector = tableSelector + ' > div[commentid]';
        const avatarSelector = commentSelector + ' > div:first-child';

        const {
            '*': _all,
            [tableSelector]: table,
            a: link,
            'a:active': link_active,
            [inputSelector]: input,
            [buttonSelector]: button,
            [buttonSelector + ' > span']: button_inner_span,
            [buttonSelector + '.login-highlight > span']: button_inner_span_not_logged,
            [buttonSelector + '.disabled']: button_disabled,
            [`${buttonSelector}:active, ${buttonSelector}.active`]: button_click,
            '.input-and-button-wrapper': input_and_button_wrapper,
            [buttonSelector + ', ' + inputSelector]: input_and_button,
            [inputSelector + ':focus']: focused_input,
            [`${buttonSelector}.active`]: focused_input_with_button_click,
            [commentSelector]: comment,
            [avatarSelector]: avatar,
            [avatarSelector + ' > img']: avatar_img,
            [commentSelector + ' > .name']: name,
            [commentSelector + ' > .time']: time,
            [commentSelector + ' > .comment']: comment_text,
            [placeholderSelector]: placeholder,
            '.box': box,
        } = ruleSetsPrecached;

        _all.add({
            'font-size': defaultFontSize,
            'font-family': defaultFontFamily,
            'font-weight': 'normal', // normalize font display
            '--input-height': 40,
        });

        const inputWithBorderHeight = {
            ruleType: 'calc',
            firstArg: inputHeight,
            operator: '+',
            secondArg: input_and_button_borderBottomWidth + 'px'
        };

        input_and_button_wrapper.add({
            width: width,
            position: 'relative',
        });

        input.add(Object.assign(generageSquareProp('padding', inputPadding * 1, 'left', inputPadding.left), {
            'min-height': {
                ruleType: 'calc',
                firstArg: inputHeight,
                operator: '-',
                secondArg: (inputPadding * 2) + 'px'
            },
            width: {
                ruleType: 'calc',
                firstArg: width,
                operator: '-',
                secondArg: (buttonWidth + inputPadding.left + inputPadding) + 'px'
            },
            display: 'inline-block',
            'background-color': '#fff',
            color: 'black',
            'border-top-left-radius': borderRadius,
            'border-bottom': `${input_and_button_borderBottomWidth}px solid ${borderColor} !important`,
            border: 0,
            resize: 'none',
            margin: 0,
            'line-height': 12,
            overflow: 'auto',
            'overflow-wrap': 'break-word',
        }));

        focused_input.add({
            outline: 'none',
            'border-bottom-color': `${themeColor} !important`,
        });

        button.add({
            width: buttonWidth,
            padding: 0,
            'border-top-right-radius': borderRadius,
            height: {
                ruleType: 'calc',
                firstArg: '100%',
                operator: '-',
                secondArg: input_and_button_borderBottomWidth + 'px',
            },
            'background-color': themeColor,
            color: '#fff',
            'font-weight': '700',
            display: 'inline-block',
            outline: 'none',
            position: 'relative',
            float: 'right',
            'text-align': 'center',
            'border-bottom': `${input_and_button_borderBottomWidth}px solid ${themeColor}`,
            position: 'absolute',
        });

        button_inner_span.add(Object.assign({
            'font-weight': 'inherit',
            'white-space': 'nowrap',
        }, childCenterBlockPreset));

        button_disabled.add({
            'background-color': borderColor,
            'border-bottom-color': borderColor,
        });

        button_click.add({
            'background-color': '#fff',
            'border-bottom-color': borderColor,
            color: themeColor,
        });

        focused_input_with_button_click.add({
            'border-bottom-color': `${themeColor} !important`,
        });

        table.add({
            'background-color': '#fff',
            padding: tablePadding,
            'border-radius': borderRadius,
            'border-top-left-radius': 0,
            'border-top-right-radius': 0,
            width: {
                ruleType: 'calc',
                firstArg: width,
                operator: '-',
                secondArg: (tablePadding * 2) + 'px',
            },
            height: {
                ruleType: 'calc',
                firstArg: height,
                operator: '-',
                secondArg: {
                    ruleType: 'calc',
                    firstArg: (tablePadding * 2) + 'px',
                    operator: '+',
                    secondArg: inputWithBorderHeight
                }
            },
            overflow: 'auto',
            position: 'relative',
        });

        link.add({
            color: 'inherit',
            'text-decoration': 'none',
            outline: 'none',
        });

        link_active.add({
            outline: 'none',
        });

        comment.add({
            width: '100%',
            display: 'grid',
            'grid-template-columns': `${avatarWidthHeight}px auto minmax(0, min-content)`,
            'grid-template-areas': "'avatar name time' 'avatar comment comment'",
            'margin-bottom': tablePadding,
        });

        avatar.add({
            width: avatarWidthHeight,
            height: avatarWidthHeight,
            'border-radius': '50%',
            'grid-area': 'avatar',
            position: 'relative',
            overflow: 'hidden',
        });

        avatar_img.add(Object.assign({
            width: avatarWidthHeight,
        }, childCenterBlockPreset));

        name.add({
            'white-space': 'nowrap',
            overflow: 'hidden',
            'text-overflow': 'ellipsis',
            'grid-area': 'name',
            color: themeColor,
            'padding-left': tablePadding,
            'padding-right': tablePadding,
        });

        time.add({
            'grid-area': 'time',
            'text-align': 'right',
            'padding-right': tablePadding,
            'white-space': 'nowrap',
        });

        comment_text.add({
            'grid-area': 'comment',
            'padding-left': tablePadding,
            'padding-right': tablePadding,
            overflow: 'auto',
            'overflow-wrap': 'break-word',
        });

        button_inner_span_not_logged.add({
            'font-family': '"AllBooms Brand Icons" !important',
            'font-size': 18,
        });

        input_and_button.add({
            'transition-property': 'border-color, background-color',
            'transition-duration': `${transitionDuration}s`,
        });

        placeholder.add({
            position: 'absolute',
            'z-index': '1',
            top: inputPadding * 1,
            left: inputPadding.left,
            'pointer-events': 'none',
            color: 'dimgray',
        });

        box.add({
            height,
            display: 'flex',
            'flex-flow': 'column',
            overflow: 'hidden',
        });

        return ruleSetsPrecached
    }
}
