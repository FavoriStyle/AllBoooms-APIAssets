import Dictionary from './dictionary'
type Langs = keyof typeof Dictionary

export default class CommentsWidget extends HTMLElement{
    constructor(appID: string, widgetID: string, options: {
        strings: {
            [x: string]: string
        }
        lang: Langs
    })
}
