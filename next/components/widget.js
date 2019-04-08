import APIReference from '../internal/APIref.js'
import { createElement, htmlSafeText, normalizeDate, currentUser, Link, currentToken, argsEncode, argsDecode } from '../internal/_system.js'
import Dictionary from './dictionary.js'
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

const createElementInTableBody = (({children: {0: table_body}}) => {
    return options => {
        table_body.innerHTML = createElement.src(options);
        return table_body.removeChild(table_body.children[0] || table_body.childNodes[0])
    }
})(createElement({
    name: 'table',
    childs: [{
        name: 'tbody'
    }]
}));

class CommentsTable{
    constructor(){
        this.table = createElement({
            name: 'table',
            childs: [{
                name: 'tbody'
            }]
        });
        this.table_body = this.table.children[0]
    }
    static _generateElement({ id, uid, avatar, name, text, time }){
        const newChild = createElementInTableBody({
            name: 'tr',
            attrs: {
                commentid: id,
            },
            childs: [
                {
                    name: 'td',
                    attrs: {
                        rowspan: 2,
                    },
                    childs: [{
                        name: 'img',
                        attrs: {
                            src: avatar,
                        },
                    }],
                },
                {
                    name: 'td',
                    childs: [{
                        name: 'a',
                        attrs: {
                            href: APIReference.baseHost + '/' + uid,
                        },
                        html: htmlSafeText(name),
                    }],
                },
                {
                    name: 'td',
                    html: normalizeDate(time),
                },
            ],
        });
        const nextChild = createElementInTableBody({
            name: 'tr',
            childs: [{
                name: 'td',
                html: htmlSafeText(text),
                attrs: {
                    colspan: 2
                },
            }],
        });
        return [newChild, nextChild]
    }
    prepend({ id, uid, avatar, name, text, time }){
        const [ newChild, nextChild ] = CommentsTable._generateElement({ id, uid, avatar, name, text, time });
        this.table_body.children[0] ? this.table_body.insertBefore(nextChild, this.table_body.children[0]) : this.table_body.appendChild(nextChild);
        this.table_body.insertBefore(newChild, nextChild)
    }
    append({ id, uid, avatar, name, text, time }){
        const [ newChild, nextChild ] = CommentsTable._generateElement({ id, uid, avatar, name, text, time });
        this.table_body.appendChild(newChild);
        this.table_body.appendChild(nextChild);
    }
}

class AllBoomsCommentsWidget extends HTMLElement{
    /** @typedef {Dictionary['ru']} _Dict */
    constructor(){
        super();
        const appID = decodeURIComponent(this.getAttribute('data-appid'));
        const widgetID = decodeURIComponent(this.getAttribute('data-widgetid'));
        const options = {
            lang: decodeURIComponent(this.getAttribute('data-lang') || 'ru'),
            strings: argsDecode(this.getAttribute('data-strings')),
        };
        /** @type {_Dict} */
        const dictionary = Dictionary[options.lang];
        const shadow = this.attachShadow({mode: 'closed'});
        this.styles = new WidgetStyle(shadow);
        //const inputWidth = this.styles.input.get('width');
        //const buttonWidth = this.styles.button.get('width');
        // inputWidth instanceof CSSCalcRule === true
        //inputWidth.secondArg = '64px';
        //buttonWidth.set(inputWidth.secondArg);
        const table = new CommentsTable;
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
        const input = inputAndButtonWrapper.children[0];
        const button = inputAndButtonWrapper.children[1];
        const buttonInnerSpan = button.children[0];
        (async () => {
            await locationProcess;
            const user = await currentUser();
            if(user){
                input.setAttribute('placeholder', dictionary.placeholder);
                buttonInnerSpan.innerText = dictionary.submitText;
                button.addEventListener('click', () => {
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
                    });
                });
                (async function requestComments(){
                    const comments = await API.comments.external.list({
                        app_id: appID,
                        widget_id: widgetID,
                        after: table.table_body.lastElementChild ? table.table_body.lastElementChild.getAttribute('commentid') : undefined,
                    });
                    const requestData = {
                        token: currentToken(),
                        list: comments.map(({userid}) => userid).filter(onlyUnique)
                    };
                    const userInfo = await API.user.getInfo(requestData);
                    console.log({ userInfo, comments, requestData });
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
                    setTimeout(requestComments, 200000)
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
            [
                inputAndButtonWrapper,
                table.table,
            ].forEach(element => shadow.appendChild(element))
        })()
    }
}

const cssVars = (() => {
    const cssVars = {
        'border-radius': 2,
        'width': 280,
        'theme-color': '#00b1b3',
        'highlighted-text-color': '#fff'
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
