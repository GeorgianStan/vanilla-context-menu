// core options are like default options, but they are not ment to be over written
export interface CoreOptions {
  transformOrigin: [string, string]; // ex top left
}
export interface DefaultOptions {
  transitionDuration: number;
  theme: 'black' | 'white';
  normalizePosition?: boolean;
}

export interface ConfigurableOptions extends Partial<DefaultOptions> {
  scope: HTMLElement;
  menuItems: MenuItem[];
  customClass?: string;
  customThemeClass?: string;
  preventCloseOnClick?: boolean; // default will be false - global value for all menu items
}

export interface Options extends ConfigurableOptions, CoreOptions {}

export interface BaseMenuOption {
  label: string;
  callback?: (ev: MouseEvent) => unknown;
  /**
   * @deprecated This property was replaced by the new iconHTML property
   */
  iconClass?: string;
  iconHTML?: string;
  preventCloseOnClick?: boolean; // default will be false - individual value for each item (it will override the global value if any)
}

export interface MenuOption extends BaseMenuOption {
  nestedMenu?: NestedMenuItem[];
}

export type MenuItem = MenuOption | 'hr';
export type NestedMenuItem = BaseMenuOption | 'hr';
