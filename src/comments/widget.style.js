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

        const buttonSelector = 'textarea + a';
        const tableSelector = '.comments-wrapper';
        const commentSelector = tableSelector + ' > div[commentid]';
        const avatarSelector = commentSelector + ' > div:first-child';

        const {
            '*': _all,
            [tableSelector]: table,
            a: link,
            'a:active': link_active,
            'textarea': input,
            [buttonSelector]: button,
            [buttonSelector + ' > span']: button_inner_span,
            [buttonSelector + '.login-highlight > span']: button_inner_span_not_logged,
            [buttonSelector + '.disabled']: button_disabled,
            [buttonSelector + ':active']: button_click,
            '.input-and-button-wrapper': input_and_button_wrapper,
            [buttonSelector + ', textarea']: input_and_button,
            'textarea:focus': focused_input,
            [commentSelector]: comment,
            [avatarSelector]: avatar,
            [avatarSelector + ' > img']: avatar_img,
            [commentSelector + ' > .name']: name,
            [commentSelector + ' > .time']: time,
            [commentSelector + ' > .comment']: comment_text,
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
            height: inputWithBorderHeight,
            position: 'relative',
            width: width,
        });

        input.add(Object.assign(generageSquareProp('padding', 12, 'left', 20), {
            height: inputWithBorderHeight,
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
            resize: 'none',
            margin: 0,
            'line-height': 12,
            overflow: 'hidden',
        }));

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
            'grid-template-columns': `${avatarWidthHeight}px auto auto`,
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
            'line-height': '0.8em',
            'padding-left': tablePadding,
            'padding-right': tablePadding,
        });

        time.add({
            'grid-area': 'time',
            'text-align': 'right',
            'line-height': '0.8em',
            'padding-right': tablePadding,
        });

        comment_text.add({
            'grid-area': 'comment',
            'padding-left': tablePadding,
            'padding-right': tablePadding,
        });

        button_inner_span_not_logged.add({
            'font-family': '"AllBooms Brand Icons" !important',
            'font-size': 18,
        });

        input_and_button.add({
            'transition-property': 'border-color, background-color',
            'transition-duration': `${transitionDuration}s`,
        });

        return ruleSetsPrecached
    }
}
