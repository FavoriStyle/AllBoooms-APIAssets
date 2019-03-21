import APIReference from '../internal/APIref.js'
import { currentDir, createElement, htmlSafeText, normalizeDate, currentUser, Link, currentToken, argsEncode, argsDecode } from '../internal/_system.js'
import Dictionary from './dictionary.js'

function onlyUnique(value, index, self){ 
    return self.indexOf(value) === index
}

const API = new APIReference

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
    prepend({ uid, avatar, name, text, time }){
        const newChild = createElement({
            name: 'tr',
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
        const nextChild = createElement({
            name: 'tr',
            childs: [{
                name: 'td',
                html: htmlSafeText(text),
                attrs: {
                    colspan: 2
                },
            }],
        });
        this.table_body.children[0] ? this.table_body.insertBefore(nextChild, this.table_body.children[0]) : this.table_body.appendChild(nextChild);
        this.table_body.insertBefore(newChild, nextChild)
    }
}

class AllBoomsCommentsWidget extends HTMLElement{
    constructor(){
        super();
        const appID = decodeURIComponent(this.getAttribute('data-appid'));
        const widgetID = decodeURIComponent(this.getAttribute('data-widgetid'));
        const options = {
            lang: decodeURIComponent(this.getAttribute('data-lang') || ''),
            strings: argsDecode(this.getAttribute('data-strings')),
        };
        if(options.strings) options.strings = JSON.parse(options.strings);
        const loc = new Link(location.href);
        const dictionary = new Dictionary(options.lang);
        const shadow = this.attachShadow({mode: 'closed'});
        const table = new CommentsTable;
        const input = createElement({
            name: 'input',
            attrs: {
                class: 'comment-input',
                placeholder: dictionary.placeholder,
            }
        });
        const button = createElement({
            name: 'button',
            class: 'comment-input-submit',
            type: 'submit',
        });
        currentUser().then(user => {
            if(user){
                input.setAttribute('placeholder', dictionary.placeholder);
                button.innerText = dictionary.submitText;
                button.addEventListener('click', () => {
                    input.disabled = true;
                    button.disabled = true;
                    API.comments.external.add({
                        token: currentToken(),
                        widget_id: widgetID,
                        text: input.value,
                    }).then(({ id, timestamp }) => {
                        input.value = '';
                        input.disabled = false;
                        button.disabled = false;
                    });
                })
            } else {
                input.setAttribute('placeholder', dictionary.userNotLogged);
                input.disabled = true;
                button.classList.add('login-highlight');
                button.innerText = dictionary.login;
                button.insertBefore(createElement({
                    name: 'i',
                    attrs: { class: 'allbooms-brand-icons-allbooms' }
                }), button.childNodes[0]);
                button.addEventListener('click', e => {
                    e.preventDefault();
                    location.href = `${APIReference.baseHost}/getToken?callback=${encodeURIComponent(loc.href)}&appid=${encodeURIComponent(appID)}`
                })
            }
            [
                createElement({
                    name: 'link',
                    attrs: {
                        rel: 'style',
                        href: currentDir() + '/widget.style.css'
                    }
                }),
                button,
                input,
                table.table,
            ].forEach(element => shadow.appendChild(element));
            (async function requestComments(){
                const comments = await API.comments.external.list({
                    app_id: appID,
                    widget_id: widgetID,
                });
                const userInfo = await API.user.getInfo({
                    token: currentToken(),
                    list: comments.map(({userid}) => userid).filter(onlyUnique)
                });
                comments.forEach(({ id, userid, text, timestamp }) => {
                    table.prepend({
                        uid: userid,
                        text: text,
                        time: timestamp,
                        name: userInfo[userid].fullName,
                        avatar: userInfo[userid].avatar,
                    })
                })
            })()
        })
    }
}
customElements.define('allbooms-comments', AllBoomsCommentsWidget);
return class {
    constructor(appID, widgetID, options){
        return createElement({
            name: 'allbooms-comments',
            attrs: {
                'data-appid': encodeURIComponent(appID),
                'data-widgetid': encodeURIComponent(widgetID),
                'data-strings': argsEncode(options.strings)
            }
        })
    }
}
