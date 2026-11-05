// page-flip 套件沒有附型別，這裡只宣告本專案用到的部分
declare module "page-flip" {
  export type FlipSettings = {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    usePortrait?: boolean;
    drawShadow?: boolean;
    maxShadowOpacity?: number;
    flippingTime?: number;
    mobileScrollSupport?: boolean;
  };

  export class PageFlip {
    constructor(element: HTMLElement, settings: FlipSettings);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    on(event: "flip", callback: (e: { data: number }) => void): this;
    flipNext(): void;
    flipPrev(): void;
    getPageCount(): number;
    getCurrentPageIndex(): number;
    destroy(): void;
  }
}
