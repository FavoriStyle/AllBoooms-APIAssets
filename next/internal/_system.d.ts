import APIReference from './APIref'
export function normalizeDate(date: Number): string
export function wait(ms: Number): Promise<void>
export const http: {
    get(url: string): Promise<string>
    post(url: string, data: any, contentType?: string): Promise<string>
}
export const Cookies: {
    get(name: string): string | undefined
    set(name: string, value: string, options: {expires: Number}): void
    del(name: string): void
}
export class Link{
    constructor(url: string);
    href: string;
    params: { [x: string]: string | undefined };
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

export const createElement: {
    (options: ElementOptions): Element
    src(options: ElementOptions): string
}
export function htmlSafeText(text: string): string
export function currentUser(): Promise<Unpromisify<ReturnType<typeof APIReference.prototype.user.getMe>> | null>
export const currentToken: {
    (): string
    save(token: string): void
}
export function argsEncode(args: {[x: string]: string}): string
export function argsDecode(args: string): {[x: string]: string}
export function rand(): string
export function setImmediate<F extends Function>(func: F): void
export function waitForProp(obj: any, prop: string | number | symbol, ...excludedValues: any[]): Promise<void>
