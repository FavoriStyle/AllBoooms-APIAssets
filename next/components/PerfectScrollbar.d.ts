declare namespace PerfectScrollbar {
    export interface Options {
        handlers?: string[]
        maxScrollbarLength?: number
        minScrollbarLength?: number
        scrollingThreshold?: number
        scrollXMarginOffset?: number
        scrollYMarginOffset?: number
        suppressScrollX?: boolean
        suppressScrollY?: boolean
        swipeEasing?: boolean
        useBothWheelAxes?: boolean
        wheelPropagation?: boolean
        wheelSpeed?: number
        root?: HTMLElement
    }
    export type XY = 'start' | 'end' | null
}

interface PerfectScrollbar {
    update(): void
    destroy(): void
    reach: {
        x: PerfectScrollbar.XY
        y: PerfectScrollbar.XY
    }
}

declare const PerfectScrollbar: {
    new(element: string | HTMLElement, options?: PerfectScrollbar.Options): Promise<PerfectScrollbar>
    prototype: Object
}

export default PerfectScrollbar
