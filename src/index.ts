// Dependencies
import { sanitize } from 'dompurify';

// Base & Template * Style
import style from './index.scss';
import template from './index.pug';

// Utils
import { normalizePozition } from './util.functions';

// Types
import {
  CoreOptions,
  DefaultOptions,
  MenuItem,
  ConfigurableOptions,
  Options,
} from './@types/interface';

interface State {
  style: Partial<CSSStyleDeclaration>;
  menuItems: MenuItem[];
}

export default class VanillaContextMenu {
  // private vars
  #initialContextMenuEvent: MouseEvent | undefined;

  #state: State = { style, menuItems: [] }; // state for pug template

  #coreOptions: CoreOptions = {
    transformOrigin: ['top', 'left'], // show not be
  };

  #defaultOptions: DefaultOptions = {
    theme: 'black',
    transitionDuration: 200,
  };

  // will be populated in constructor
  //@ts-ignore
  #options: Options = {};

  // private methods

  /**
   * Interpolate the state variables inside the pug element and create an HTML Element
   */
  #buildContextMenu = (): HTMLElement => {
    const wrapper: HTMLElement = document.createElement('div');
    wrapper.innerHTML = template(this.#state);

    const contextMenu: HTMLElement = wrapper.children[0] as HTMLElement;

    return contextMenu;
  };

  #removeExistingContextMenu = (): void => {
    document.querySelector(`.${style['context-menu']}`)?.remove();
  };

  #applyStyleOnContextMenu = (
    contextMenu: HTMLElement,
    outOfBoundsOnX: boolean,
    outOfBoundsOnY: boolean
  ): void => {
    // transition duration
    contextMenu.style.transitionDuration = `${
      this.#options.transitionDuration
    }ms`;

    // set the transition origin based on it's position
    const transformOrigin: [string, string] = Array.from(
      this.#options.transformOrigin
    ) as [string, string];

    outOfBoundsOnX && (transformOrigin[1] = 'right');
    outOfBoundsOnY && (transformOrigin[0] = 'bottom');

    contextMenu.style.transformOrigin = transformOrigin.join(' ');

    // apply theme or custom css style
    if (this.#options.customThemeClass) {
      contextMenu.classList.add(this.#options.customThemeClass);
    } else {
      contextMenu.classList.add(
        style[`context-menu--${this.#options.theme}-theme`]
      );
    }

    this.#options.customClass &&
      contextMenu.classList.add(this.#options.customClass);
  };

  #bindCallbacks = (contextMenu: HTMLElement): void => {
    this.#options.menuItems.forEach((menuItem: MenuItem, index: number) => {
      if (menuItem === 'hr' || !menuItem.callback) {
        return;
      }

      const htmlEl: HTMLElement = contextMenu.children[index] as HTMLElement;

      htmlEl.onclick = () => {
        menuItem.callback(this.#initialContextMenuEvent);

        // global value for all menu items, or the individual option or false
        const preventCloseOnClick: boolean =
          menuItem.preventCloseOnClick ??
          this.#options.preventCloseOnClick ??
          false;

        if (!preventCloseOnClick) {
          this.#removeExistingContextMenu();
        }
      };
    });
  };

  #onShowContextMenu = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();

    // store event so it can be passed to callbakcs
    this.#initialContextMenuEvent = event;

    // the current context menu should disappear when a new one is displayed
    this.#removeExistingContextMenu();

    // build and show on ui
    const contextMenu: HTMLElement = this.#buildContextMenu();
    document.querySelector('body').append(contextMenu);

    // set the position
    const { clientX: mouseX, clientY: mouseY } = event;

    const { normalizedX, normalizedY } = normalizePozition(
      { x: mouseX, y: mouseY },
      contextMenu,
      this.#options.scope
    );

    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    // apply the css configurable style
    this.#applyStyleOnContextMenu(
      contextMenu,
      mouseX !== normalizedX,
      mouseY !== normalizedY
    );

    // disable context menu for it
    contextMenu.oncontextmenu = (e) => e.preventDefault();

    // bind the callbacks on each option
    this.#bindCallbacks(contextMenu);

    // make it visible but wait an event loop to pass
    setTimeout(() => {
      contextMenu.classList.add(style['visible']);
    });
  };

  /**
   * Used to determine if the user has clicked outside of the context menu and if so to close it
   * @param event
   */
  #onDocumentClick = (event: MouseEvent): void => {
    const clickedTarget: HTMLElement = event.target as HTMLElement;

    if (clickedTarget.closest(`.${style['context-menu']}`)) {
      return;
    }
    this.#removeExistingContextMenu();
  };

  constructor(configurableOptions: ConfigurableOptions) {
    this.updateOptions(configurableOptions);

    // bind the required event listeners
    this.#options.scope.oncontextmenu = this.#onShowContextMenu;

    // add a click event listener to create a modal effect for the context menu and close it if the user clicks outside of it
    document.addEventListener('click', this.#onDocumentClick);
  }

  /**
   * Sanitize the HTML content for menu icons
   * @param menuItems
   */
  #sanitizeMenuIcons = (menuItems: MenuItem[]): MenuItem[] =>
    menuItems.map((item) => {
      typeof item === 'object' &&
        item.hasOwnProperty('iconHTML') &&
        // TODO replace DOMPurify with Sanitize API when it will be supported https://developer.mozilla.org/en-US/docs/Web/API/HTML_Sanitizer_API
        (item.iconHTML = sanitize(item.iconHTML));

      return item;
    });

  // Public methods (API)

  /**
   * Remove all the event listeners that were registered for this feature
   */
  off(): void {
    document.removeEventListener('click', this.#onDocumentClick);
    this.#options.scope.oncontextmenu = null;
  }

  updateOptions(configurableOptions: Partial<ConfigurableOptions>): void {
    const sanitizedMenuItems = this.#sanitizeMenuIcons(
      configurableOptions.menuItems
    );

    // extend default options and bind the menu items inside the state for pug template
    Object.assign(this.#options, this.#defaultOptions);
    Object.assign(this.#options, {
      ...configurableOptions,
      menuItems: sanitizedMenuItems,
    });
    Object.assign(this.#options, this.#coreOptions);

    this.#state.menuItems = this.#options.menuItems;
  }
}
