# APIAssets
[![](https://img.shields.io/badge/KaMeHb__UA-Telegram-%230088cc.svg?longCache=true&style=flat-square)](https://t.me/KaMeHb_UA)
[![](https://data.jsdelivr.com/v1/package/gh/FavoriStyle/AllBoooms-APIAssets/badge)](https://www.jsdelivr.com/package/gh/FavoriStyle/AllBoooms-APIAssets)

## Описание
Репозиторий содержит реализацию работы с [API](https://api.allbooms.com/dev/) сайта [allbooms.com](https://allbooms.com). Код предоставлен в виде модулей для [Require](https://github.com/KaMeHb-UA/require). Не все модули обратно совместимы со стандартом [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1), поэтому рекомендуется использовать именно [Require](https://github.com/KaMeHb-UA/require).

## Быстрый старт
### Подключение комментариев к своему сайту
Для начала работы, подключите файл `comments/widget.min.js` этого репозитория к своему коду:
```javascript
require('https://cdn.jsdelivr.net/gh/FavoriStyle/AllBoooms-APIAssets@1/comments/widget.min.js').then(CommentsWidget => {
    var myWidget = new CommentsWidget('ID_приложения', 'ID_виджета');
    document.body.appendChild(myWidget);
});
```
В коде выше, `ID_приложения` необходимо получить в панели управления разработчика на сайте [allbooms.com](https://allbooms.com). `ID_виджета` — это уникальный текстовый идентификатор для каждого отдельного виджета, который не регулируется со стороны сервера [AllBooms](https://allbooms.com). Другими словами, `ID_виджета` разработчик придумывает сам.

## Низкоуровневое взаимодействие с API
**Для работы с API напрямую, подключите `APIref.min.js`:**
```javascript
require('https://cdn.jsdelivr.net/gh/FavoriStyle/AllBoooms-APIAssets@1/APIref.min.js').then(APIReference => {

    var API = new APIReference;

    // ПРИМЕР
    // Для получения списка комментариев достаточно выполнить следующее (см. https://allbooms.com:3000/AllBoooms/API_Docs/src/layer1/comments.md):
    var result = API.comments.external.list({
        app_id: 'ID_приложения',
        widget_id: 'ID_виджета'
    });
    // result будет содержать Promise, который резолвится в ответ сервера. Если сервер ответил с ненулевым кодом ошибки, то она будет передана клиенту для дальнейшей обработки как любой другой внутренней ошибки JS
    result.then(data => {
        console.log('Данные получены:');
        console.log(data);
    }).catch(err => {
        console.log('Данные не получены:');
        console.error(err);
    });
});
```
