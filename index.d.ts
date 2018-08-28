/**
 * Just an example for modern CJS-like modue system ( https://github.com/KaMeHb-UA/require )
 */
declare const require:function(String):Promise<any>;
declare const __dirname:String;
declare const __filename:String;
declare namespace API{
    export const Reference = (() => {
        type Attachments = Array<{
            type: 'image',
            src: String,
        } | {
            type: 'link',
            src: String,
            preview: String,
            text: String,
            title: String,
        } | {
            type: 'document',
            src: String,
            documentType: 'text' | 'office_doc' | 'office_table' | 'office_presentation' | 'not_recognized',
            name: String,
        } | {
            type: 'audio',
            src: String,
            artist: String,
            name: String,
        } | {
            type: 'video',
            src: String,
            name: String,
            length: Number,
            videoType: 'direct' | 'youtube',
        }>;
        return class APIReference{
            messages: {
                chats: {
                    list(args: {
                        token: String,
                    }):Promise<Array<String>>
                },
                list(args: {
                    token: String,
                    chat_id: String,
                    count?: Number,
                    after?: String,
                    reversed?: Boolean,
                }):Promise<Array<{
                    text: String,
                    timestamp: Number,
                    edited: Number,
                    id: String,
                    sender: String,
                    attachments?: Attachments,
                }>>,
                send(args: {
                    token: String,
                    destination: String,
                    message: {
                        text: String,
                        attachments?: Attachments,
                    },
                }):Promise<{
                    timestamp: Number,
                    id: String,
                }>,
                edit(args: {
                    token: String,
                    destination: String,
                    message: {
                        id: String,
                        text: String,
                        attachments?: Attachments,
                    },
                }):Promise<Number>,
                delete(args: {
                    token: String,
                    destination: String,
                    message_id: String,
                    forAnyone?: Boolean,
                }):Promise<true>,
            };
            static baseHost:String;
        }
    })();
}
