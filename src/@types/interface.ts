export interface DefaultOptions {}

export interface MenuItem {
  label: string;
  callback: () => any;
}

export interface Options extends DefaultOptions {
  scope: HTMLElement;
  menuItems: MenuItem[];
}
