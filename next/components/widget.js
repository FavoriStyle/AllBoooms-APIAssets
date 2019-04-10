import APIReference from '../internal/APIref.js'
import { createElement, htmlSafeText, normalizeDate, currentUser, Link, currentToken, argsEncode, argsDecode } from '../internal/_system.js'
import * as Dictionary from './dictionary.js'
import WidgetStyle from './widget.style.js'
import AllboomsBrandIcon from '../internal/allbooms-brand-icons/index.js';

const API = new APIReference;

/*-----------------------------*\
| Saving cookies if needed      |
\*-----------------------------*/
const locationProcess = (async () => {
    const loc = new Link(location.href);
    if(loc.params.save_allbooms_token !== undefined && loc.params.token){
        const currentUser = await API.user.getMe({
            token: loc.params.token,
        });
        if(currentUser) currentToken.save(loc.params.token);
        delete loc.params.save_allbooms_token;
        delete loc.params.token;
        window.history.pushState(null, null, loc.href);
    }
})();

function onlyUnique(value, index, self){ 
    return self.indexOf(value) === index
}

class CommentsTable{
    constructor(root){
        this.root = root;
    }
    static _generateElement({ id, uid, avatar, name, text, time }){
        return createElement({
            name: 'div',
            attrs: {
                commentid: id,
            },
            childs: [
                {
                    name: 'img',
                    attrs: {
                        src: avatar,
                    },
                },
                {
                    name: 'div',
                    attrs: {
                        class: 'name',
                    },
                    childs: [{
                        name: 'a',
                        attrs: {
                            href: APIReference.baseHost + '/' + uid,
                        },
                        html: htmlSafeText(name),
                    }],
                },
                {
                    name: 'div',
                    attrs: {
                        class: 'time',
                    },
                    html: normalizeDate(time)
                },
                {
                    name: 'div',
                    attrs: {
                        class: 'comment',
                    },
                    html: htmlSafeText(text)
                },
            ],
        })
    }
    prepend({ id, uid, avatar, name, text, time }){
        this._lastId = id;
        const child = CommentsTable._generateElement({ id, uid, avatar, name, text, time });
        const firstComment = this.root.querySelector('div[commentid]');
        firstComment ? this.root.insertBefore(child, firstComment) : this.root.appendChild(child)
    }
    append({ id, uid, avatar, name, text, time }){
        this._lastId = id;
        const child = CommentsTable._generateElement({ id, uid, avatar, name, text, time });
        this.root.appendChild(child)
    }
}

class AllBoomsCommentsWidget extends HTMLElement{
    /** @typedef {Dictionary.Dictionary} Dictionary */
    constructor(){
        super();
        const appID = decodeURIComponent(this.getAttribute('data-appid'));
        const widgetID = decodeURIComponent(this.getAttribute('data-widgetid'));
        const options = {
            lang: decodeURIComponent(this.getAttribute('data-lang') || 'ru'),
            strings: argsDecode(this.getAttribute('data-strings')),
        };
        /** @type {Dictionary} */
        const dictionary = Dictionary[options.lang];
        const shadow = this.attachShadow({mode: 'closed'});
        this.styles = new WidgetStyle(shadow);
        //const inputWidth = this.styles.input.get('width');
        //const buttonWidth = this.styles.button.get('width');
        // inputWidth instanceof CSSCalcRule === true
        //inputWidth.secondArg = '64px';
        //buttonWidth.set(inputWidth.secondArg);
        const inputAndButtonWrapper = createElement({
            name: 'div',
            attrs: {
                class: 'input-and-button-wrapper',
            },
            childs: [
                {
                    name: 'input',
                    attrs: {
                        placeholder: dictionary.placeholder,
                    },
                },
                {
                    name: 'a',
                    attrs: {
                        href: '#',
                        draggable: 'false',
                    },
                    childs: [{
                        name: 'span'
                    }],
                },
            ]
        });
        const commentsWrapper = createElement({
            name: 'div',
            attrs: {
                class: 'comments-wrapper',
            },
        });
        const input = inputAndButtonWrapper.children[0];
        const button = inputAndButtonWrapper.children[1];
        const buttonInnerSpan = button.children[0];
        const table = new CommentsTable(commentsWrapper);
        (async () => {
            await locationProcess;
            const user = await currentUser();
            if(user){
                input.setAttribute('placeholder', dictionary.placeholder);
                buttonInnerSpan.innerText = dictionary.submitText;
                button.addEventListener('click', () => {
                    if(input.value){
                        input.disabled = true;
                        button.classList.add('disabled');
                        API.comments.external.add({
                            token: currentToken(),
                            widget_id: widgetID,
                            text: input.value,
                        }).then(({ id, timestamp }) => {
                            input.value = '';
                            input.disabled = false;
                            button.classList.remove('disabled');
                        })
                    } else {
                        alert(dictionary.noCommentText)
                    }
                });
                (async function requestComments(){
                    const requestData = {
                        app_id: appID,
                        widget_id: widgetID,
                        after: table._lastId,
                        reversed: true,
                    };
                    const comments = await API.comments.external.list(requestData);
                    console.log({ comments, requestData });
                    const userInfo = await API.user.getInfo({
                        token: currentToken(),
                        list: comments.map(({userid}) => userid).filter(onlyUnique),
                        
                    });
                    comments.forEach(({ id, userid, text, timestamp }) => {
                        table.prepend({
                            id,
                            text,
                            time: timestamp,
                            uid: userid,
                            name: userInfo[userid].fullName,
                            avatar: userInfo[userid].avatar,
                        })
                    });
                    setTimeout(requestComments, 2000)
                })()
            } else {
                input.setAttribute('placeholder', dictionary.userNotLogged);
                input.disabled = true;
                button.classList.add('login-highlight');
                buttonInnerSpan.innerText = dictionary.login;
                buttonInnerSpan.append(' ', new AllboomsBrandIcon('allbooms'));
                button.addEventListener('click', e => {
                    const loc = new Link(location.href);
                    loc.params.save_allbooms_token = '';
                    e.preventDefault();
                    location.href = `https://${APIReference.baseHost}/getToken?callback=${encodeURIComponent(loc.href)}&appid=${encodeURIComponent(appID)}`
                })
            }
            shadow.append(inputAndButtonWrapper, commentsWrapper)
        })()
    }
}

const cssVars = (() => {
    const cssVars = {
        'border-radius': 2,
        'width': 280,
        'height': 400,
        'theme-color': '#00b1b3',
        'highlighted-text-color': '#fff',
    };
    var res = '';
    for(var i in cssVars) res += `--${i}:${typeof cssVars[i] == 'number' ? cssVars[i] + 'px' : cssVars[i]};`;
    return res
})();

customElements.define('allbooms-comments', AllBoomsCommentsWidget);
export default class {
    constructor(appID, widgetID, options){
        options = options || {};
        /** @type {AllBoomsCommentsWidget} */
        const element = createElement({
            name: 'allbooms-comments',
            attrs: {
                'data-appid': encodeURIComponent(appID),
                'data-widgetid': encodeURIComponent(widgetID),
                'data-strings': argsEncode(options.strings),
                'data-lang': encodeURIComponent(options.lang || ''),
                style: cssVars,
            }
        });
        return element
    }
}
