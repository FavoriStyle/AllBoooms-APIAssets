import { rand, createElement } from './_system.js'

const RuleID = Symbol();
const RuleProp = Symbol();
const RuleVal = Symbol();
const Sheet = Symbol();
const Set = Symbol();
const Rule = Symbol();
const RuleSetInnerHTML = Symbol();
const CalcRuleProps = Symbol();
const tab = (() => {
    const tabulation = '    ';
    return (num = 1) => {
        var res = '';
        for(var i = 0; i < num; i++) res += tabulation;
        return res
    }
})();
class CSSRuleSetError extends Error{}

export class CSSRule{
    constructor(prop, val, ruleset){
        this[RuleID] = `${prop}_${rand()}_${rand()}`;
        this[RuleProp] = prop;
        this[Set] = ruleset;
        this[Symbol.toPrimitive] = () => `${prop}: ${typeof this[RuleVal] == 'number' && this[RuleVal] !== 0 ? this[RuleVal] + 'px' : this[RuleVal]};`;
        this[Rule] = this;
        this.set(val);
        return new Proxy(this[Rule], {});
    }
    set(val){
        const idSplitter = `/* ${this[RuleID]} */\n`;
        this[RuleVal] = val;
        const parts = (this[Set][RuleSetInnerHTML] || '').split(idSplitter);
        const parts2 = (parts[1] || '').split('\n');
        parts2.shift();
        parts[1] = parts2.join('\n');
        this[Set][RuleSetInnerHTML] = parts.join(idSplitter + `${tab()}${this}\n`)
    }
    get(){
        return this[RuleVal]
    }
    remove(){
        const idSplitter = `${this[RuleID]}\n`;
        this[RuleVal] = null;
        const parts = (this[Set][RuleSetInnerHTML] || '').split(idSplitter);
        const parts2 = (parts[1] || '').split('\n');
        parts2.shift();
        parts[1] = parts2.join('\n');
        this[Set][RuleSetInnerHTML] = parts.join('');
        this[Rule] = null;
        this[Set][Set].arr.splice(this[Set][Set].store[this[RuleProp]], 1)
    }
}

export class CSSCalcRule extends CSSRule{
    constructor(prop, { firstArg, operator, secondArg }, ruleset){
        super(prop, `calc(${firstArg} ${operator} ${secondArg})`, ruleset);
        this[CalcRuleProps] = {};
        this.firstArg = firstArg;
        this.operator = operator;
        this.secondArg = secondArg;
    }
    set firstArg(val){
        this[CalcRuleProps].firstArg = val;
        super.set(`calc(${val} ${this[CalcRuleProps].operator} ${this[CalcRuleProps].secondArg})`)
    }
    get firstArg(){
        return this[CalcRuleProps].firstArg
    }
    set operator(val){
        if(val != '+' && val != '-' && val != '*' && val != '/') throw new TypeError('operator must be one of +, -, * or /');
        this[CalcRuleProps].operator = val;
        super.set(`calc(${this[CalcRuleProps].firstArg} ${val} ${this[CalcRuleProps].secondArg})`)
    }
    get operator(){
        return this[CalcRuleProps].operator
    }
    set secondArg(val){
        if((this[CalcRuleProps].operator === '*' || this[CalcRuleProps].operator === '/') && typeof val !== 'number') throw new TypeError('secondArg must be of type number because of operator is ' + this[CalcRuleProps].operator);
        this[CalcRuleProps].secondArg = val;
        super.set(`calc(${this[CalcRuleProps].firstArg} ${this[CalcRuleProps].operator} ${val})`)
    }
    get secondArg(){
        return this[CalcRuleProps].secondArg
    }
}

function isCalcRule(val){
    return val && typeof val === 'object' && val.ruleType === 'calc'
}

export default class CSSRuleSet{
    constructor(selector, stylesRoot = document.head){
        const selectorEncoded = encodeURIComponent(selector);
        var stylesheet = document.querySelector(`style[data-selector="${selectorEncoded}"]`);
        if(!stylesheet){
            stylesheet = createElement({ name: 'style', html: `${selector}{\n\n}` });
            stylesRoot.appendChild(stylesheet);
        }
        Object.defineProperty(this, 'selector', {
            writable: false,
            configurable: false,
            value: selector
        });
        this[Sheet] = stylesheet;
        this[Set] = {store: {}, arr: []};
    }
    get [RuleSetInnerHTML](){
        const parts = this[Sheet].innerHTML.split('\n');
        parts.shift();
        parts.pop();
        return parts.join('\n');
    }
    set [RuleSetInnerHTML](val){
        this[Sheet].innerHTML = `${this.selector}{\n${val}\n}`
    }
    get(prop){
        return this[Set].store[prop] !== undefined ? this[Set].arr[this[Set].store[prop]] : null
    }
    add(prop, val){
        if(typeof val === 'undefined' && typeof prop === 'object'){
            var res = {};
            for(var i in prop) res[i] = this.add(i, prop[i]);
            return res
        }
        if(typeof prop !== 'string') throw new TypeError('prop must be of type string, given ' + typeof prop);
        if(typeof val !== 'string' && typeof val !== 'number' && !isCalcRule(val))
            throw new TypeError('val must be of type string, number or object with ruleType: "calc", given ' + typeof prop);
        if(this.get(prop)) throw new CSSRuleSetError(prop + ' rule is already defined. Use a CSSRule instance instead');
        var rule;
        if(isCalcRule(val)) rule = new CSSCalcRule(prop, val, this); else rule = new CSSRule(prop, val, this);
        this[Set].store[prop] = this[Set].arr.push(rule) - 1;
        return rule
    }
    all(){
        return [...this[Set].arr]
    }
}
