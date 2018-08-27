const APIref = await require(__dirname + '/APIref.js'),
    API = new APIref,
    dictionary = {
        'ru': {
            placeholder: 'Ваш комментарий',
            submitText: 'Отправить',
            submittingText: 'Отправка...',
        }
    },
    defaultStyles = `
@import url('https://fonts.googleapis.com/css?family=Roboto');
.allbooms-comments-widget{
    width: 280px;
}
.allbooms-single-comment{
    width: 100%;
}
.allbooms-single-comment a > img{
    max-height: 42px;
    border-radius: 50%;
}
.allbooms-single-comment tr:first-child > td:first-child{
    width: 42px;
    vertical-align: top;
}
.allbooms-single-comment tr:first-child > td:last-child{
    width: 55px;
    text-align: right;
}
.allbooms-single-comment tr:first-child > td:nth-child(2){
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
}
.allbooms-single-comment tr:first-child > td:nth-child(2) > a{
    width: 1px;
    display: inline-block;
}
.allbooms-comments-widget *{
    font-size: 12px;
    font-family: 'Roboto', sans-serif;
}
.allbooms-comments-widget .comment-input-submit{
    float: right;
    width: 80px;
    border: 0;
    background: transparent;
}
.allbooms-comments-widget .comment-input{
    width: calc(100% - 80px);
    border: 0;
    border-bottom: 2px solid darkgrey;
    transition: 1s;
}
.allbooms-comments-widget .comment-input:focus{
    outline: none;
    border-bottom-color: #00b1b3;
}
.allbooms-comments-container{
    margin-top: 10px;
    max-height: 400px;
    overflow-y: auto;
}
`;
function wait(ms){
    return new Promise(r => setTimeout(r, ms))
}
function addDefaultStyle(){
    var def = document.querySelector('style[name="allbooms-comments-default"]');
    if(!def){
        let style = document.createElement('style');
        style.innerHTML = defaultStyles;
        style.setAttribute('name', 'allbooms-comments-default');
        document.head.appendChild(style)
    }
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
        static async getMe(){
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
        addDefaultStyle();
        options = Object.assign({
            lang: 'ru'
        }, options);
        const dict = Object.assign(dictionary[options.lang], options.strings),
            CommentsList = new class extends Array{
                constructor(){
                    super();
                    this.ids = []
                }
                add(elem){
                    if(this.ids.indexOf(elem.id) == -1){
                        this.push(elem);
                        this.ids.push(elem.id);
                        return elem
                    }
                }
            };
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
            const comments = new class extends Array{
                prependNew(tagretArray = {comments:[]}){
                    tagretArray.comments.reverse().forEach(elem => {
                        elem.user = tagretArray.users[elem.userid];
                        elem = CommentsList.add(elem);
                        if(elem) updateContainer(elem);
                    })
                }
            };
            (async function requestComments(){
                comments.prependNew((await API.comments.external.list({
                    app_id: appID,
                    widget_id: widgetID,
                })));
                await wait(2000);
                requestComments();
            })();
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
