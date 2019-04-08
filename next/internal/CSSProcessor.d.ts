type Omit<T, K> = Pick<T, Exclude<keyof T, K>>
type CSSValue = number | string
type CSSCalcValue = {
    ruleType: 'calc'
    firstArg: CSSValues
} & ({
    operator: '+' | '-'
    secondArg: CSSValues
} | {
    operator: '*' | '/'
    secondArg: Exclude<CSSValues, string>
})
type CSSValues = CSSValue | CSSCalcValue
type AnyCSSRule = CSSRule | CSSCalcRule

export class CSSCalcRule extends CSSRule{
    constructor<Value extends Omit<CSSCalcValue, 'ruleType'>>(prop: string, val: Value, ruleset: CSSRuleSet)
    firstArg: CSSValues
    operator: '+' | '-' | '*' | '/'
    secondArg: CSSValues
}

export class CSSRule{
    constructor(prop: string, val: CSSValues, ruleset: CSSRuleSet)
    set(val: CSSValues): void
    get(): CSSValues
    remove(): void
}

export default class CSSRuleSet{
    constructor(selector: string, stylesRoot?: Element)
    get(prop: string): AnyCSSRule
    add(prop: string, val: CSSValues): AnyCSSRule
    add(rules: { [prop: string]: CSSValues }): { [prop: string]: AnyCSSRule }
    all(): AnyCSSRule[]
}
