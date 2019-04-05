import APIReference from './APIref'
export function normalizeDate(date: Number): String
export function wait(ms: Number): Promise<void>
export const http: {
    get(url: String): Promise<String>
    post(url: String, data: any, contentType?: String): Promise<String>
}
export const Cookies: {
    get(name: String): String | undefined
    set(name: String, value: String, options: {expires: Number}): void
    del(name: String): void
}
export class Link{
    constructor(url: String);
    href: String;
    params: {[String]: String};
}
export class ExtString extends String{
    reverse(): ExtString
}
export function currentFile(): string
export function currentDir(): string

type ElementOptions = {
    name: string
    attrs?: { [x: string]: string }
    html?: string
    childs?: ElementOptions[]
}

type Unpromisify<T> = T extends Promise<infer R> ? R : never

type CreateElementFunction = ((options: ElementOptions) => Element) & { src: (options: ElementOptions) => string }

export const createElement: CreateElementFunction
export function htmlSafeText(text: string): string
export function currentUser(): Promise<Unpromisify<ReturnType<typeof APIReference.prototype.user.getMe>> | null>
export function currentToken(): string
export function argsEncode(args: {[x: string]: string}): string
export function argsDecode(args: string): {[x: string]: string}
export function rand(): string
export function setImmediate<F extends Function>(func: F): void
export function waitForProp(obj: any, prop: string | number | symbol, ...excludedValues: any[]): Promise<void>
