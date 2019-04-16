# APIAssets
[![](https://img.shields.io/badge/KaMeHb__UA-Telegram-%230088cc.svg?longCache=true&style=flat-square)](https://t.me/KaMeHb_UA)
[![](https://data.jsdelivr.com/v1/package/gh/FavoriStyle/AllBoooms-APIAssets/badge)](https://www.jsdelivr.com/package/gh/FavoriStyle/AllBoooms-APIAssets?path=dist)

## Описание
**Репозиторий содержит реализацию работы с [API](https://api.allbooms.com/dev/) сайта [allbooms.com](https://allbooms.com). Начиная с версии 3, код предоставлен в виде ES6-модулей**

## Быстрый старт
### Подключение комментариев к своему сайту
Для начала работы, подключите файл `dist/comments/widget.js` этого репозитория к своему коду:
```javascript
import CommentsWidget from 'https://cdn.jsdelivr.net/gh/FavoriStyle/AllBoooms-APIAssets@3/dist/comments/widget.js';

const myWidget = new CommentsWidget('ID_приложения', 'ID_виджета');
document.body.appendChild(myWidget);
```
В коде выше, `ID_приложения` необходимо получить в панели управления разработчика на сайте [allbooms.com](https://allbooms.com). `ID_виджета` — это уникальный текстовый идентификатор для каждого отдельного виджета, который не регулируется со стороны сервера [AllBooms](https://allbooms.com). Другими словами, `ID_виджета` разработчик придумывает сам.

## Низкоуровневое взаимодействие с API
**Для работы с API напрямую, подключите `dist/internal/APIref.js`:**
```javascript
import APIReference from 'https://cdn.jsdelivr.net/gh/FavoriStyle/AllBoooms-APIAssets@3/dist/internal/APIref.js'

const API = new APIReference;

// ПРИМЕР
// Для получения списка комментариев достаточно выполнить следующее (см. https://allbooms.com:3000/AllBoooms/API_Docs/src/layer1/comments.md):
(async () => {
    try{
        const result = await API.comments.external.list({
            app_id: 'ID_приложения',
            widget_id: 'ID_виджета'
        });
        console.log('Данные получены:', result);
    } catch(e){
        console.error('Данные не получены:', e);
    }
})();
```
