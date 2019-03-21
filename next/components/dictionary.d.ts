interface Dictionary{
    placeholder: string
    submitText: string
    submittingText: string
    userNotLogged: string
    login: string
}

const Dictionary: {
    new(lang: 'ru'): Dictionary
    prototype: Dictionary
}

export default Dictionary
