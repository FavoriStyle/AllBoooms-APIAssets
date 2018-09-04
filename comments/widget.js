module.exports = await (async () => {
    'use strict';
    // re-usable (cached) promise
    const getDefinitions = (() => {
        const definitions = (async () => {
            const { APIref, API: _API, defaultStyles, currentUser, normalizeDate, http, wait } = await (
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
                 * @property {UserDefinition} currentUser
                 * @property {DateNormalizator} normalizeDate
                 * @property {HTTP} http
                 * @property {AsyncWait} wait
                 */
                /**
                 * @return {Promise<Response>}
                 */
                async () => {
                    const [
                        { _system: { normalizeDate, wait, http }, defaultStyles },
                        { APIref, API, currentUser },
                    ] = await Promise.all([
                        // Independent threads
                        (async () => {
                            const _system = await require(__dirname + '/../_system.min.js');
                            return {
                                _system,
                                defaultStyles: await _system.http.get(__dirname + '/style.css')
                            }
                        })(),
                        (async () => {
                            const APIref = await require(__dirname + '/../APIref.min.js'),
                                API = new APIref;
                            return {
                                APIref,
                                API,
                                currentUser:
                                /*
                                await API.user.getInfo([
                                    'id',
                                    'fullName',
                                    'avatar',
                                ])
                                /*/
                                {
                                    id: '0TksO20JRaX4jP9sACjL0HosH0l1',
                                    fullName: 'Влад <KaMeHb> Марченко',
                                    avatar: 'https://firebasestorage.googleapis.com/v0/b/social-net-test.appspot.com/o/images%2F77576c58-a824-467c-a688-5f8d2140bbc8.jpg?alt=media&token=a8d732ff-1e90-4bc2-868c-32b42439b594',
                                    _token: "`3\\M`Yo'&9I+'sN&W%G\"ldxGAtE+LJMyc.8ngRY!j=i!'|Q35^'\"wW*5g)D\"WfC@"
                                }
                                //*/
                            }
                        })(),
                    ]);
                    return {
                        APIref,
                        API,
                        defaultStyles,
                        currentUser,
                        normalizeDate,
                        wait,
                        http,
                    }
                }
            )();
            return {
                APIref,
                API: _API,
                defaultStyles,
                dictionary: {
                    'ru': {
                        placeholder: 'Ваш комментарий',
                        submitText: 'Отправить',
                        submittingText: 'Отправка...',
                    }
                },
                http,
                wait,
                currentUser,
                normalizeDate,
            }
        })();
        return () => definitions
    })();
    // wrapper to not to lost JSDoc Context
    return await (async () => {
        const { APIref, API, dictionary, wait, normalizeDate, currentUser } = await getDefinitions();
        /*-----------------------------*\
        | Adding stylesheet to the page |
        \*-----------------------------*/
        (async () => {
            const {defaultStyles} = await getDefinitions(),
                style = document.createElement('style');
            style.innerHTML = defaultStyles;
            style.setAttribute('name', 'allbooms-comments-default');
            document.head.appendChild(style)
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
                table.setAttribute('class', 'allbooms-single-comment');
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
                // Создаём элементы
                var myComment = document.createElement('input'),
                    submit = document.createElement('input'),
                    commentsList = document.createElement('div'),
                    style = document.createElement('style');
                // Добавляем элементы в контейнер
                this.conainer.appendChild(myComment);
                this.conainer.appendChild(submit);
                this.conainer.appendChild(commentsList);
                this.conainer.appendChild(style);
                // Применяем настройки
                myComment.placeholder = dict.placeholder;
                myComment.setAttribute('class', 'comment-input');
                submit.type = 'submit';
                submit.setAttribute('class', 'comment-input-submit');
                submit.value = dict.submitText;
                commentsList.setAttribute('class', 'allbooms-comments-container');
                style.setAttribute('scoped', '');
                style.innerHTML = options.style || '';
                // Изменяем поведение кнопки
                submit.addEventListener('click', async ev => {
                    ev.preventDefault();
                    if(myComment.value){
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
    })()
})();
