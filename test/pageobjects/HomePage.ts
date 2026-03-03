export interface IHomePage {
    isPageLoaded(): Promise<boolean>;
    getProductLabelText(): Promise<string>;
    openMenu(): Promise<void>; // Added this to support the flow from your screenshots
}