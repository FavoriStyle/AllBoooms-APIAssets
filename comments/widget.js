'use strict';
const getDefinitions = (() => {
    // reusable promise
    const definitions = (async function(){
        const { APIref, defaultStyles } = await (
            /**
             * @typedef Response
             * @property {typeof API.Reference} APIref
             * @property {String} defaultStyles
             */
            /**
             * @return {Promise<Response>}
             */
            async () => {
                const [
                    APIref,
                    defaultStyles,
                ] = Promise.all([
                    await require(__dirname + '/../APIref.js'),
                    await http.get(__dirname + '/style.css'),
                ]);
                return { APIref, defaultStyles }
            }
        )();
        return {
            APIref,
            API: new APIref,
            defaultStyles,
            dictionary: {
                'ru': {
                    placeholder: 'Ваш комментарий',
                    submitText: 'Отправить',
                    submittingText: 'Отправка...',
                }
            },
            http: {
                /**
                 * Gets contents from url
                 * @param {String} url
                 * @return {Promise<String>}
                 */
                get(url){
                    var xhr = new XMLHttpRequest();
                    return new Promise((resolve, reject) => {
                        xhr.open('GET', url, true);
                        xhr.onreadystatechange = () => {
                            if (xhr.readyState != 4) return;
                            if (xhr.status != 200) reject(new Error(`Cannot get requested url. Error ${xhr.status}: ${xhr.statusText}`)); else resolve(xhr.responseText);
                        };
                        xhr.send()
                    })
                },
                /**
                 * Sends POST to url
                 * @param {String} url
                 * @param {any} data
                 * @return {Promise<String>}
                 */
                post(url, data, contentType = 'application/x-www-form-urlencoded'){
                    var xhr = new XMLHttpRequest();
                    return new Promise((resolve, reject) => {
                        xhr.open('POST', url, true);
                        xhr.setRequestHeader('Content-Type', contentType);
                        xhr.onreadystatechange = () => {
                            if (xhr.readyState != 4) return;
                            if (xhr.status != 200) reject(new Error(`Cannot post to requested url. Error ${xhr.status}: ${xhr.statusText}`)); else resolve(xhr.responseText);
                        };
                        xhr.send(data);
                    })
                }
            },
            /**
             * Waits specified time, then resolves
             * @param {Number} ms
             * @return {Promise<void>}
             */
            wait: ms => new Promise(r => setTimeout(r, ms))
        }
    })();
    return () => definitions
})();
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
/**
 * 
 */
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
         */
        prependNew(list = {comments:[]}){
            list.comments.reverse().forEach(elem => {
                elem.user = list.users[elem.userid];
                elem = add.apply(this, [elem]);
                if(elem) updateContainer(elem);
            })
        }
    }
})();
/**
 * Requests comments list recursively
 * @param {CommentList} targetList
 */
async function requestComments(targetList, timeout = 2000){
    const {API} = await getDefinitions();
    targetList.prependNew((await API.comments.external.list({
        app_id: appID,
        widget_id: widgetID,
    })));
    await wait(timeout);
    requestComments(targetList, timeout);
}
const UserController = (() => {
    var cache = {
        me: {
            id: '0TksO20JRaX4jP9sACjL0HosH0l1',
            fullName: 'Влад <KaMeHb> Марченко',
            avatar: 'https://firebasestorage.googleapis.com/v0/b/social-net-test.appspot.com/o/images%2F77576c58-a824-467c-a688-5f8d2140bbc8.jpg?alt=media&token=a8d732ff-1e90-4bc2-868c-32b42439b594'
        }
    };
    return class UserController{
        /**
         * @return {Promise<{id:String,fullName:String,avatar:String}>}
         */
        static async getMe(){
            const {API} = await getDefinitions();
            if(!cache.me){
                let udata = await API.user.getInfo([
                    'id',
                    'fullName',
                    'avatar'
                ]);
                cache.me = udata
            }
            return cache.me
        }
    }
})();































module.exports = class CommentsWidget{
    constructor(appID, widgetID, options){
        const {API, dictionary} = await getDefinitions();
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
                    token: "`3\\M`Yo'&9I+'sN&W%G\"ldxGAtE+LJMyc.8ngRY!j=i!'|Q35^'\"wW*5g)D\"WfC@",
                    widget_id: widgetID,
                    text: myComment.value,
                });
                var myComment = CommentsList.add({
                    id,
                    timestamp,
                    user: await UserController.getMe(),
                    text: myComment.value
                });
                if(myComment) updateContainer(myComment);
                submit.value = dict.submitText;
                submit.removeAttribute('disabled')
            }
        });
        // Периодично запрашиваем новые комментарии
        const updateContainer = (() => {
            function normalizeDate(date){
                return 'вчера'
            }
            const comments = new class extends Array{
                prependNew(tagretArray = {comments:[]}){
                    tagretArray.comments.reverse().forEach(elem => {
                        elem.user = tagretArray.users[elem.userid];
                        elem = CommentsList.add(elem);
                        if(elem) updateContainer(elem);
                    })
                }
            };
            requestComments();
            return function updateContainer(element){
                element = new CommentContainer(element);
                if(commentsList.firstElementChild){
                    commentsList.insertBefore(element, commentsList.firstElementChild)
                } else {
                    commentsList.appendChild(element)
                }
            }
        })();
        return this.conainer
    }
}
