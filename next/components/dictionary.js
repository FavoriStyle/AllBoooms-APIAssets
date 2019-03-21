const dict = {
    ru: {
        placeholder: 'Ваш комментарий',
        submitText: 'Отправить',
        submittingText: 'Отправка...',
        userNotLogged: 'Для добавления комментария',
        login: 'Войдите',
    },
};
export default class Dictionary{
    constructor(lang){
        return dict[lang]
    }
}
