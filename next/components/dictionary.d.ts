type DictionaryWords =
      'placeholder'
    | 'submitText'
    | 'submittingText'
    | 'userNotLogged'
    | 'login'
    | 'noCommentText'

export type Dictionary = {
    [T in DictionaryWords]: string
}

export const ru: Dictionary
