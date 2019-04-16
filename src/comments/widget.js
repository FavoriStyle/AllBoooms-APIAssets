import APIReference from '../internal/APIref.js'
import { createElement, htmlSafeText, normalizeDate, currentUser, Link, currentToken, argsEncode, argsDecode, Awaiter, wait } from '../internal/_system.js'
import * as Dictionary from './dictionary.js'
import WidgetStyle from './widget.style.js'
import PerfectScrollbar from './PerfectScrollbar.js'
import '../internal/roboto.js'
import '../internal/allbooms-brand-icons.js'

/**
 * @typedef {T extends Promise<infer R> ? R : T} Unpromisify
 * @template T
 */

const requestTimeout = 2000;

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

class CommentsTable{
    constructor(root){
        this.root = root;
    }
    static _dateUpdate(elem, time){
        const _ = normalizeDate(time);
        if(elem.innerText !== _) elem.innerText = _
    }
    static _generateElement({ id, uid, avatar, name, text, time }){
        const elem = createElement({
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
        });
        setInterval(this._dateUpdate.bind(null, elem.children[2], time), 1000);
        return elem
    }
    _commentAlreadyThere(id){
        return !!this.root.querySelector(`div[commentid="${id}"]`)
    }
    prepend({ id, uid, avatar, name, text, time }){
        if(this._commentAlreadyThere(id)) return;
        this._lastId = id;
        const child = CommentsTable._generateElement({ id, uid, avatar, name, text, time });
        const firstComment = this.root.querySelector('div[commentid]');
        firstComment ? this.root.insertBefore(child, firstComment) : this.root.appendChild(child)
    }
    append({ id, uid, avatar, name, text, time }){
        if(this._commentAlreadyThere(id)) return;
        this._lastId = id;
        const child = CommentsTable._generateElement({ id, uid, avatar, name, text, time });
        this.root.appendChild(child)
    }
}

const userStorage = Symbol();

function setIntervalForAsync(f, t){
    function f2(){
        f().then(nextCycle)
    }
    var nextCycle = setTimeout.bind(null, f2, t);
    f2()
}

function _getCommentId(elem){
    if(elem){
        return elem.getAttribute('commentid')
    }
}

class AllBoomsCommentsWidget extends HTMLElement{
    /** @typedef {Dictionary.Dictionary} Dictionary */
    constructor(){
        super();
        this.appID = decodeURIComponent(this.getAttribute('data-appid'));
        this.widgetID = decodeURIComponent(this.getAttribute('data-widgetid'));
        const createUserStorage = (function(){
            this[userStorage] = Object.assign([], {
                awaiters: {},
                clear: createUserStorage,
            })
        }).bind(this);
        createUserStorage();
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
        this.table = new CommentsTable(commentsWrapper);
        // scrollbar processing
        (async () => {
            const scrollbar = await new PerfectScrollbar(commentsWrapper, { root: shadow });
            var needNextCycle = true;
            commentsWrapper.addEventListener('ps-scroll-y', async () => {
                if(needNextCycle && commentsWrapper.getBoundingClientRect().bottom - commentsWrapper.children[commentsWrapper.children.length - 11].getBoundingClientRect().y >= 0 && !this._requestBusy){
                    this._requestBusy = true;
                    if(!await this.requestComments()) needNextCycle = false;
                    this._requestBusy = false
                }
            })
        })();
        // user processing
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
                            widget_id: this.widgetID,
                            text: input.value,
                        }).then(({ id, timestamp }) => {
                            input.value = '';
                            input.disabled = false;
                            button.classList.remove('disabled');
                        })
                    } else {
                        alert(dictionary.noCommentText)
                    }
                })
            } else {
                input.setAttribute('placeholder', dictionary.userNotLogged);
                input.disabled = true;
                button.classList.add('login-highlight');
                buttonInnerSpan.innerText = dictionary.login;
                button.addEventListener('click', e => {
                    const loc = new Link(location.href);
                    loc.params.save_allbooms_token = '';
                    e.preventDefault();
                    location.href = `https://${APIReference.baseHost}/getToken?callback=${encodeURIComponent(loc.href)}&appid=${encodeURIComponent(this.appID)}`
                })
            }
            shadow.append(inputAndButtonWrapper, commentsWrapper)
        })();
        // comments request
        (async () => {
            this._requestBusy = true;
            await this.requestComments();
            this._requestBusy = false;
            setTimeout(this.listenForComments.bind(this), requestTimeout)
        })()
    }
    getFirstCommentId(){
        return _getCommentId(this.table.root.querySelector('div[commentid]'))
    }
    getLastCommentId(){
        const list = this.table.root.querySelectorAll('div[commentid]');
        return _getCommentId(list[list.length - 1])
    }
    async requestComments(reversed = false){
        const onNewComment = this.onNewComment.bind(this, reversed ? 'prepend' : 'append');
        const requestData = {
            app_id: this.appID,
            widget_id: this.widgetID,
            after: reversed ? this.getFirstCommentId(): this.getLastCommentId(),
            reversed,
        };
        const comments = await API.comments.external.list(requestData);
        comments.forEach(onNewComment);
        return comments.length;
    }
    /** @param {string} uid */
    userInfo(uid){
        /** @type {string[] & { awaiters: Object<string, Awaiter<Unpromisify<ReturnType<typeof API.user.getInfo>>['']>>, clear(): void }} */
        const storage = this[userStorage];
        storage.latest = uid;
        if(!storage.awaiters[uid]){
            storage.awaiters[uid] = new Awaiter;
            storage.push(uid);
            wait(20).then(() => {
                if(storage.latest === uid){
                    storage.clear();
                    API.user.getInfo({
                        list: storage,
                    }).then(info => {
                        storage.forEach(uid => {
                            storage.awaiters[uid].resolve(info[uid])
                        })
                    }).catch(e => {
                        storage.forEach(uid => {
                            storage.awaiters[uid].reject(e)
                        })
                    })
                }
            })
        }
        return storage.awaiters[uid]
    }
    async onNewComment(mode, { id, userid, text, timestamp }){
        const { fullName: name, avatar } = await this.userInfo(userid);
        this.table[mode]({
            id,
            text,
            time: timestamp,
            uid: userid,
            name,
            avatar,
        })
    }
    listenForComments(){
        setIntervalForAsync(this.requestComments.bind(this, true), requestTimeout)
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
        return createElement({
            name: 'allbooms-comments',
            attrs: {
                'data-appid': encodeURIComponent(appID),
                'data-widgetid': encodeURIComponent(widgetID),
                'data-strings': argsEncode(options.strings),
                'data-lang': encodeURIComponent(options.lang || ''),
                style: cssVars,
            }
        })
    }
}