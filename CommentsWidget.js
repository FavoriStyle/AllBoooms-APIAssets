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
div.allbooms-comments-container > .allbooms-single-comment a > img{
    max-height: 42px;
    border-radius: 50%;
}
`;
function wait(ms){
    return new Promise(r => setTimeout(r, ms))
}

module.exports = class CommentsWidget{
    constructor(appID, widgetID, options){
        options = Object.assign({
            lang: 'ru'
        }, options);
        const dict = Object.assign(dictionary[options.lang], options.strings);
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
        style.innerHTML = defaultStyles + (options.style || '');
        // Изменяем поведение кнопки
        submit.addEventListener('click', async ev => {
            ev.preventDefault();
            if(myComment.value){
                submit.value = dict.submittingText;
                await API.comments.external.add({
                    token: "`3\\M`Yo'&9I+'sN&W%G\"ldxGAtE+LJMyc.8ngRY!j=i!'|Q35^'\"wW*5g)D\"WfC@",
                    widget_id: widgetID,
                    text: myComment.value,
                });
                submit.value = dict.submitText;
            }
        });
        // Периодично запрашиваем новые комментарии
        (() => {
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
            function createCommentElement({id, text, user: {id: uid, fullName: uname, avatar: uavatar}, timestamp}){
                const userAvatar = document.createElement('img'),
                    userLink = document.createElement('a'),
                    userName = document.createElement('span'),
                    commentText = document.createElement('p'),
                    commentTime = document.createElement('span'),
                    container = document.createElement('div');
                userAvatar.setAttribute('src', uavatar);
                userLink.setAttribute('href', `https://${APIref.baseHost}/${uid}`);
                userName.innerText = uname;
                commentText.innerText = text;
                commentTime.innerText = normalizeDate(new Date(timestamp * 1000));
                container.setAttribute('class', 'allbooms-single-comment');
                container.appendChild(userLink);
                container.appendChild(commentTime);
                container.appendChild(commentText);
                userLink.appendChild(userAvatar);
                userLink.appendChild(userName);
                return container
            }
            function updateContainer(toPrepend){
                toPrepend.forEach(element => {
                    element = createCommentElement(element);
                    if(commentsList.firstElementChild){
                        commentsList.insertBefore(element, commentsList.firstElementChild)
                    } else {
                        commentsList.appendChild(element)
                    }
                })
            }
            const comments = new class extends Array{
                prependNew(tagretArray){
                    var toPrepend = [];
                    for(var i = 0; i < tagretArray.length; i++){
                        if(tagretArray[i].id != (this[0] || {}).id) toPrepend.push(tagretArray[i]); else {
                            toPrepend = toPrepend.reverse();
                            updateContainer(toPrepend);
                            return this.unshift(...toPrepend)
                        }
                    }
                    toPrepend = toPrepend.reverse();
                    updateContainer(toPrepend);
                    return this.unshift(...toPrepend)
                }
            };
            (async function requestComments(){
                comments.prependNew((await API.comments.external.list({
                    app_id: appID,
                    widget_id: widgetID,
                })));
                await wait(2000);
                requestComments();
            })()
        })();
        return this.conainer
    }
}
