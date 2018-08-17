const API = await require(__dirname + '/APIref.js'),
    dictionary = {
        'ru': {
            placeholder: 'Ваш комментарий',
            submitText: 'Отправить',
            submittingText: 'Отправка...',
        }
    };

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
        const myComment = document.createElement('input'),
            submit = document.createElement('input'),
            commentsList = document.createElement('div');
        // Добавляем элементы в контейнер
        this.conainer.appendChild(myComment);
        this.conainer.appendChild(submit);
        this.conainer.appendChild(commentsList);
        // Применяем настройки
        myComment.placeholder = dict.placeholder;
        myComment.setAttribute('class', 'comment-input');
        submit.type = 'submit';
        submit.setAttribute('class', 'comment-input-submit');
        submit.value = dict.submitText;
        // Изменяем поведение кнопки
        console.log([submit, submit.addEventListener]);
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
        })
        // Периодично запрашиваем новые комментарии
        (() => {
            function normalizeDate(Date){
                return 'вчера'
            }
            function createCommentElement({id, text, user: {id: uid, fullName: uname, avatar: uavatar}, timestamp}){
                const userAvatar = document.createElement('img'),
                    userName = document.createElement('a'),
                    commentText = document.createElement('p'),
                    commentTime = document.createElement('span'),
                    container = document.createElement('div');
                userAvatar.setAttribute('src', uavatar);
                userName.setAttribute('href', `${API.baseHost}/${uid}`);
                userName.innerText = uname;
                commentText.innerText = text;
                commentTime.innerText = normalizeDate(new Date(timestamp * 1000));
                container.appendChild(userAvatar);
                container.appendChild(userName);
                container.appendChild(commentTime);
                container.appendChild(commentText);
                return container
            }
            function updateContainer(toPrepend){
                toPrepend.forEach(element => commentsList.insertBefore(createCommentElement(element), commentsList.firstElementChild))
            }
            const comments = new class extends Array{
                prependNew(tagretArray){
                    var toPrepend = [];
                    for(var i = 0; i < tagretArray.length; i++){
                        if(tagretArray[i].id != this[0].id) toPrepend.push(tagretArray[i]); else {
                            updateContainer(toPrepend);
                            return this.unshift(...toPrepend)
                        }
                    }
                }
            };
            (async function requestComments(){
                comments.prependNew((await API.comments.external.list({
                    app_id: appID,
                    widget_id: widgetID,
                })));
                comments.updateContainer();
                await wait(2000);
                requestComments();
            })()
        })();
    }
}