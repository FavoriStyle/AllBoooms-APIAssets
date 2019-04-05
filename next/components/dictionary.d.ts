import * as _Dictionary from './dictionary'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

const Dictionary: Omit<typeof _Dictionary, 'default'>
export default Dictionary

interface Dict{
    placeholder: string
    submitText: string
    submittingText: string
    userNotLogged: string
    login: string
}

export const ru: Dict
