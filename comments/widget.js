'use strict';
const console = (loggerName => {
    var __syncEnd = false,
        logs = [];
    window.console.groupCollapsed(loggerName);
    return new Proxy(window.console, {
        get(target, name){
            if(__syncEnd){

            }
        }
    })
})('AllBooms comments widget');
// fonts MUST be defined in main DOM, so...
document.head.appendChild((() => {
    var imports = [
        'https://fonts.googleapis.com/css?family=Roboto',
        'https://cdn.jsdelivr.net/gh/FavoriStyle/AllBooms-brand-icons@3.0.0/dist/allbooms-brand-icons.css',
    ];
    imports.forEach((link, i) => {
        imports[i] = `@import url("${
            link.replace('"', '%22').replace('\\', '%5C')
        }");\n`
    });
    var fontsImporter = document.createElement('style');
    fontsImporter.innerHTML = imports.join('');
    console.log('Added global style to use fonts in widget:\n', fontsImporter.firstChild);
    return fontsImporter
})());
// re-usable (cached) promise
const getDefinitions = (() => {
    const definitions = (async () => {
        const { APIref, API: _API, defaultStyles, currentUser, normalizeDate, http, wait, ExtString, Link, Cookies } = await (
            /**
             * @typedef UserDefinition
             * @prop {String} id
             * @prop {String} fullName
             * @prop {String} avatar
             * @prop {String} _token
             */
            /**
             * @typedef Response
             * @property {typeof API.Reference} APIref
             * @property {API.Reference} API
             * @property {String} defaultStyles
             * @property {UserDefinition | null} currentUser
             * @property {_system.DateNormalizator} normalizeDate
             * @property {_system.HTTP} http
             * @property {_system.AsyncWait} wait
             * @property {typeof _system.ExtString} ExtString
             * @property {typeof _system.Link} Link
             * @property {_system.Cookies} Cookies
             */
            /**
             * @return {Promise<Response>}
             */
            async () => {
                const [
                    { _system: { normalizeDate, wait, http, ExtString, Link, Cookies }, defaultStyles },
                    { APIref, API, currentUser },
                ] = await (async () => {
                    const _system = require(__dirname + '/../_system.min.js');
                    return await Promise.all([
                        // Independent threads
                        (async () => {
                            const _ = await _system;
                            return {
                                _system: _,
                                defaultStyles: await _.http.get(__dirname + '/style.css')
                            }
                        })(),
                        (async () => {
                            const APIref = await require(__dirname + '/../APIref.min.js'),
                                API = new APIref,
                                // _system is not an initiator but Promise itself, so MAY be used without Promise.all in parallel way
                                token = (await _system).Cookies.get('allbooms_token');
                            var res = {
                                APIref,
                                API,
                                currentUser: token ? await API.user.getInfo({
                                    token,
                                    list: [
                                        'id',
                                        'fullName',
                                        'avatar',
                                    ]
                                }) : {},
                            };
                            if(!res.currentUser.id) res.currentUser = null; else res.currentUser._token = token;
                            return res
                        })(),
                    ]);
                })();
                return {
                    APIref,
                    API,
                    defaultStyles,
                    currentUser,
                    normalizeDate,
                    wait,
                    http,
                    ExtString,
                    Link,
                    Cookies,
                }
            }
        )();
        return {
            APIref,
            API: _API,
            defaultStyles,
            dictionary: {
                ru: {
                    placeholder: 'Ваш комментарий',
                    submitText: 'Отправить',
                    submittingText: 'Отправка...',
                    userNotLogged: 'Для добавления комментария',
                    login: 'Войдите',
                }
            },
            http,
            wait,
            currentUser,
            normalizeDate,
            String: ExtString,
            Link,
            Cookies,
        }
    })();
    return () => definitions
})();

const res = (async () => {
    const { APIref, API, dictionary, wait, normalizeDate, Link, Cookies, defaultStyles } = await getDefinitions();
    var { currentUser } = await getDefinitions();
    /*-----------------------------*\
    | Saving cookies if needed      |
    \*-----------------------------*/
    await (async () => {
        var loc = new Link(location.href);
        if(loc.params.save_allbooms_token !== undefined && loc.params.token){
            currentUser = await API.user.getInfo({
                token: loc.params.token,
                list: [
                    'id',
                    'fullName',
                    'avatar',
                ]
            });
            if(currentUser) Cookies.set('allbooms_token', loc.params.token);
            delete loc.params.save_allbooms_token;
            delete loc.params.token;
            window.history.pushState(null, null, loc.href);
        }
    })();
    /*--------------------------------------------------------*\
    | Class that represents table-container for single comment |
    \*--------------------------------------------------------*/
    class CommentContainer{
        constructor({id, text, user: {id: uid, fullName: uname, avatar: uavatar}, timestamp}){
            const table = document.createElement('table'),
                tbody = document.createElement('tbody'),
                tr1 = document.createElement('tr'),
                tr2 = document.createElement('tr'),
                avatarContainer = document.createElement('td'),
                userNameContainer = document.createElement('td'),
                commentTimeContainer = document.createElement('td'),
                commentTextContainer = document.createElement('td'),
                userAvatarLink = document.createElement('a'),
                userNameLink = document.createElement('a'),
                userAvatar = document.createElement('img');
            // Собираем таблицу воедино
            avatarContainer.setAttribute('rowspan', '2');
            commentTextContainer.setAttribute('colspan', '2');
            table.appendChild(tbody);
            tbody.appendChild(tr1);
            tbody.appendChild(tr2);
            tr1.appendChild(avatarContainer);
            tr1.appendChild(userNameContainer);
            tr1.appendChild(commentTimeContainer);
            tr2.appendChild(commentTextContainer);
            // Вносим реальные контейнеры в таблицу
            avatarContainer.appendChild(userAvatarLink);
            userAvatarLink.appendChild(userAvatar);
            userNameContainer.appendChild(userNameLink);
            // Вносим данные
            userAvatar.setAttribute('src', uavatar);
            userAvatarLink.setAttribute('href', `https://${APIref.baseHost}/${uid}`);
            userNameLink.setAttribute('href', `https://${APIref.baseHost}/${uid}`);
            userNameLink.innerText = uname;
            commentTimeContainer.innerText = normalizeDate(new Date(timestamp * 1000));
            commentTextContainer.innerText = text;
            // Помечаем элементы
            table.setAttribute('class', 'single-comment');
            return table;
        }
    }
    /*------------------------------------------------------------*\
    | Array-like class that can prepend only non-existent comments |
    \*------------------------------------------------------------*/
    const CommentList = (() => {
        function add(elem){
            if(this.ids.indexOf(elem.id) == -1){
                this.push(elem);
                this.ids.push(elem.id);
                return elem
            }
        }
        return class CommentList extends Array{
            constructor(){
                super();
                this.ids = []
            }
            /**
             * Prepends to self list only the new comments
             * @param {{comments:Array<API.CommentList>,users:API.UserList}} list
             * @param {Element} commentsList
             */
            prependNew(list = {comments:[]}, commentsList){
                list.comments.reverse().forEach(elem => {
                    elem.user = list.users[elem.userid];
                    elem = add.apply(this, [elem]);
                    if(elem) updateContainer(elem, commentsList);
                })
            }
        }
    })();
    /**
     * Requests comments list recursively
     * @param {CommentList} targetList
     * @param {Element} container
     * @param {String} appID
     * @param {String} widgetID
     */
    async function requestComments(targetList, container, appID, widgetID, timeout = 2000){
        targetList.prependNew(await API.comments.external.list({
            app_id: appID,
            widget_id: widgetID,
        }), container);
        await wait(timeout);
        requestComments(targetList, container, appID, widgetID, timeout);
    }
    /**
     * @param {Element} commentsList 
     */
    function updateContainer(element, commentsList){
        element = new CommentContainer(element);
        if(commentsList.firstElementChild){
            commentsList.insertBefore(element, commentsList.firstElementChild)
        } else {
            commentsList.appendChild(element)
        }
    }
    return class CommentsWidget{
        constructor(appID, widgetID, options){
            options = Object.assign({
                lang: 'ru'
            }, options);
            const dict = Object.assign(dictionary[options.lang], options.strings),
                CommentsList = new CommentList;
            // Создаём контейнер
            this.conainer = document.createElement('div');
            this.conainer.id = `comments-widget-${widgetID}`;
            this.conainer.setAttribute('class', 'allbooms-comments-widget');
            this.conainer.setAttribute('style', 'width: 280px; --theme-color: #00b1b3; --highlighted-text-color: #ffffff');
            // Создаём элементы
            var myComment = document.createElement('input'),
                submit = document.createElement('button'),
                commentsList = document.createElement('div'),
                style = document.createElement('style'),
                shadowRoot = this.conainer.attachShadow({mode: 'closed'});
            // Добавляем элементы в к̶о̶н̶т̶е̶й̶н̶е̶р ShadowRoot
            console.log([shadowRoot]);
            shadowRoot.appendChild(myComment);
            shadowRoot.appendChild(submit);
            shadowRoot.appendChild(commentsList);
            shadowRoot.appendChild(style);
            // Применяем настройки
            myComment.placeholder = dict.placeholder;
            myComment.setAttribute('class', 'comment-input');
            submit.type = 'submit';
            submit.setAttribute('class', 'comment-input-submit');
            submit.innerText = dict.submitText;
            commentsList.setAttribute('class', 'comments-container');
            style.innerHTML = defaultStyles + (options.style || '');
            if(!currentUser){
                myComment.placeholder = dict.userNotLogged;
                myComment.setAttribute('disabled', '');
                submit.innerText = dict.login;
                submit.innerHTML = submit.innerHTML + ' <i class="allbooms-brand-icons-allbooms"></i>';
                submit.classList.add('login-highlight');
            }
            // Изменяем поведение кнопки
            submit.addEventListener('click', async ev => {
                ev.preventDefault();
                if(!currentUser){
                    var link = new Link(location.href);
                    link.params.save_allbooms_token = '';
                    window.location.href = `https://allbooms.com/getToken?callback=${encodeURIComponent(link.href)}&appid=${encodeURIComponent(appID)}`;
                } else if(myComment.value){
                    submit.setAttribute('disabled', '');
                    submit.value = dict.submittingText;
                    let {id, timestamp} = await API.comments.external.add({
                        token: currentUser._token,
                        widget_id: widgetID,
                        text: myComment.value,
                    });
                    var myComment = CommentsList.add({
                        id,
                        timestamp,
                        user: currentUser,
                        text: myComment.value
                    });
                    if(myComment) updateContainer(myComment, commentsList);
                    submit.value = dict.submitText;
                    submit.removeAttribute('disabled')
                }
            });
            requestComments(CommentsList, commentsList, appID, widgetID);
            return this.conainer
        }
    }
})();
exports.__esModule = true;
exports.default = res;
