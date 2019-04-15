type Attachments = ({
    type: 'image'
    src: string
} | {
    type: 'link'
    src: string
    preview: string
    text: string
    title: string
} | {
    type: 'document'
    src: string
    documentType: 'text' | 'office_doc' | 'office_table' | 'office_presentation' | 'not_recognized'
    name: string
} | {
    type: 'audio'
    src: string
    artist: string
    name: string
} | {
    type: 'video'
    src: string
    name: string
    length: number
    videoType: 'direct' | 'youtube'
})[]

type CommentList = {
    id: string
    text: string
    userid: string
    timestamp: number
}[]

type UserInfo = {
    avatar: string
    email: string
    fullName: string | null
}

type UserProfile = UserInfo & {
    banner: string
    birthday: number
    companyName: string
    creationDate: number
    id: string
    state: 'active'
    tagLine: string
    twitterId: string
    webUrl: string
}

type UserProviderProfile = UserInfo & {
    providerId: string
    userId: string
}

export default class APIReference{
    messages: {
        chats: {
            list(args: {
                token: string
            }): Promise<string[]>
        }
        list(args: {
            token: string
            chat_id: string
            count?: number
            after?: string
            reversed?: Boolean
        }): Promise<{
            text: string
            timestamp: number
            edited: number
            id: string
            sender: string
            attachments?: Attachments
        }[]>
        send(args: {
            token: string
            destination: string
            message: {
                text: string
                attachments?: Attachments
            }
        }): Promise<{
            timestamp: number
            id: string
        }>
        edit(args: {
            token: string
            destination: string
            message: {
                id: string
                text: string
                attachments?: Attachments
            }
        }): Promise<number>
        delete(args: {
            token: string
            destination: string
            message_id: string
            forAnyone?: Boolean
        }): Promise<true>
    }
    comments: {
        external: {
            list(args: {
                app_id: string
                widget_id: string
            }): Promise<CommentList>
            add(args: {
                token: string
                widget_id: string
                text: string
            }): Promise<{
                id: string
                timestamp: number
            }>
        }
    }
    user: {
        getInfo(args: {
            token: string
            list: string[]
        }): Promise<{[x: string]: UserProfile | UserProviderProfile}>
        getMe(args: {
            token: string
        }): Promise<UserProfile | UserProviderProfile>
    }
    static baseHost: string;
}
