export type ThemeOption = "light" | "dark" | "system";
export type SidebarOption = "expanded" | "collapsed" | "auto";

export interface PreferencesState {
    theme: ThemeOption;
    fontSize: string;
    compactMode: boolean;
    denseTable: boolean;
    reducedMotion: boolean;
    language: string;
    timezone: string;
    dateFormat: string;
    currency: string;
    sidebarNavigation: SidebarOption;
}