import CSSRuleSet from '../internal/CSSProcessor.js'

interface WidgetStyle{
    [x: string]: CSSRuleSet
}

const WidgetStyle: {
    new(stylesRoot?: Element): WidgetStyle
    prototype: WidgetStyle
}

export default WidgetStyle
