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
  MenuOption,
} from './@types/interface';

interface State {
  style: Partial<CSSStyleDeclaration>;
  menuItems: MenuItem[];
}

class BaseContextMenu {
  // private vars

  #state: State = { style, menuItems: [] }; // state for pug template

  #coreOptions: CoreOptions = {
    transformOrigin: ['top', 'left'], // show not be
  };

  #defaultOptions: DefaultOptions = {
    theme: 'black',
    transitionDuration: 200,
    normalizePosition: true,
  };

  // public properties

  //@ts-ignore
  options: Options = {}; // will be populated in constructor

  initialContextMenuEvent: MouseEvent | undefined;

  // private methods
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

  /**
   * If a menu option has a nested menu, then bind the click event handler that will open the menu
   */
  #bindNestedMenuListener(menuItems: MenuItem[]): MenuItem[] {
    menuItems
      .filter(
        (item) => typeof item === 'object' && item.hasOwnProperty('nestedMenu')
      )
      .map((item: MenuOption) => {
        const providedCallback = item.callback;

        item.callback = (ev: MouseEvent) => {
          providedCallback && providedCallback(ev);
          new NestedContextMenu(
            {
              ...this.options,
              menuItems: item.nestedMenu,
            },
            ev,
            //@ts-ignore
            document.getElementById(`context-menu-item-${item._id}`)
          );
        };
      });

    return menuItems;
  }

  #addIdToMenuItems(menuItems: MenuItem[]) {
    menuItems
      .filter((item) => typeof item === 'object')
      .forEach((item: MenuOption, index) => {
        //@ts-ignore
        item._id = Date.now() + index;
        if (item.nestedMenu) this.#addIdToMenuItems(item.nestedMenu);
      });
  }

  applyStyleOnContextMenu = (
    contextMenu: HTMLElement,
    outOfBoundsOnX: boolean,
    outOfBoundsOnY: boolean
  ): void => {
    // transition duration
    contextMenu.style.transitionDuration = `${this.options.transitionDuration}ms`;

    // set the transition origin based on it's position
    const transformOrigin: [string, string] = Array.from(
      this.options.transformOrigin
    ) as [string, string];

    outOfBoundsOnX && (transformOrigin[1] = 'right');
    outOfBoundsOnY && (transformOrigin[0] = 'bottom');

    contextMenu.style.transformOrigin = transformOrigin.join(' ');

    // apply theme or custom css style
    if (this.options.customThemeClass) {
      contextMenu.classList.add(this.options.customThemeClass);
    } else {
      contextMenu.classList.add(
        style[`context-menu--${this.options.theme}-theme`]
      );
    }

    this.options.customClass &&
      contextMenu.classList.add(this.options.customClass);
  };

  /**
   * Interpolate the state variables inside the pug element and create an HTML Element
   */
  buildContextMenu = (): HTMLElement => {
    const wrapper: HTMLElement = document.createElement('div');
    wrapper.innerHTML = template(this.#state);

    const contextMenu: HTMLElement = wrapper.children[0] as HTMLElement;

    return contextMenu;
  };

  updateOptions(configurableOptions: Partial<ConfigurableOptions>): void {
    const sanitizedMenuItems = this.#sanitizeMenuIcons(
      configurableOptions.menuItems
    );

    const menuItems = this.#bindNestedMenuListener(sanitizedMenuItems);
    this.#addIdToMenuItems(menuItems);

    // extend default options and bind the menu items inside the state for pug template
    Object.assign(this.options, this.#defaultOptions);
    Object.assign(this.options, {
      ...configurableOptions,
      menuItems,
    });
    Object.assign(this.options, this.#coreOptions);

    this.#state.menuItems = this.options.menuItems;
  }

  getNormalizedPosition = (mouseX: number, mouseY: number, contextMenu: HTMLElement): { normalizedX: number; normalizedY: number } => {
    let normalizedX = mouseX;
    let normalizedY = mouseY;

    // Check if normalization is required
    if (this.options.normalizePosition) {
      const normalizedPosition = normalizePozition(
        { x: mouseX, y: mouseY },
        contextMenu,
        this.options.scope
      );
      normalizedX = normalizedPosition.normalizedX;
      normalizedY = normalizedPosition.normalizedY;
    }

    return { normalizedX, normalizedY };
  }
}

class NestedContextMenu extends BaseContextMenu {
  // private methods
  #removeExistingNestedContextMenu = (): void => {
    document
      .querySelector(`.${style['context-menu']}.nested-context-menu`)
      ?.remove();
  };

  #bindCallbacks = (contextMenu: HTMLElement): void => {
    this.options.menuItems.forEach((menuItem: MenuItem, index: number) => {
      if (menuItem === 'hr' || !menuItem.callback) {
        return;
      }

      const htmlEl: HTMLElement = contextMenu.children[index] as HTMLElement;

      htmlEl.onclick = () => {
        menuItem.callback(this.initialContextMenuEvent);

        // global value for all menu items, or the individual option or false
        const preventCloseOnClick: boolean =
          menuItem.preventCloseOnClick ??
          this.options.preventCloseOnClick ??
          false;

        if (!preventCloseOnClick) {
          this.#removeExistingNestedContextMenu();
          document.querySelector(`.${style['context-menu']}`)?.remove();
        }
      };
    });
  };

  #showContextMenu(event: MouseEvent, parentEl: HTMLElement) {
    // store event so it can be passed to callbakcs
    this.initialContextMenuEvent = event;

    // the current context menu should disappear when a new one is displayed
    this.#removeExistingNestedContextMenu();

    // build and show on ui
    const contextMenu: HTMLElement = this.buildContextMenu();
    contextMenu.classList.add('nested-context-menu');

    document.querySelector('body').append(contextMenu);

    // apply the css configurable style
    this.applyStyleOnContextMenu(contextMenu, false, false);

    // set the position
    const { x: parentX, y: parentY } = parentEl.getBoundingClientRect();

    // eslint-disable-next-line prefer-const
    let { normalizedX, normalizedY } = this.getNormalizedPosition(parentX, parentY, contextMenu);

    normalizedX = normalizedX + contextMenu.clientWidth;

    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    // disable context menu for it
    contextMenu.oncontextmenu = (e) => e.preventDefault();

    // bind the callbacks on each option
    this.#bindCallbacks(contextMenu);

    // make it visible but wait an event loop to pass
    setTimeout(() => {
      contextMenu.classList.add(style['visible']);
    });
  }

  constructor(
    configurableOptions: ConfigurableOptions,
    event: MouseEvent,
    parentEl: HTMLElement
  ) {
    super();

    this.updateOptions(configurableOptions);

    this.#showContextMenu(event, parentEl);
  }
}

export default class VanillaContextMenu extends BaseContextMenu {
  #removeExistingContextMenu = (): void => {
    this.#removeExistingNestedContextMenus();
    document.querySelector(`.${style['context-menu']}`)?.remove();
  };

  #removeExistingNestedContextMenus = (): void => {
    document
      .querySelectorAll(`.${style['context-menu']}.nested-context-menu`)
      .forEach((el) => el.remove());
  };

  #bindCallbacks = (contextMenu: HTMLElement): void => {
    this.options.menuItems.forEach((menuItem: MenuItem, index: number) => {
      if (menuItem === 'hr' || !menuItem.callback) {
        return;
      }

      const htmlEl: HTMLElement = contextMenu.children[index] as HTMLElement;

      htmlEl.onclick = () => {
        menuItem.callback(this.initialContextMenuEvent);

        // global value for all menu items, or the individual option or false
        const preventCloseOnClick: boolean =
          menuItem.preventCloseOnClick ??
          this.options.preventCloseOnClick ??
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
    this.initialContextMenuEvent = event;

    // the current context menu should disappear when a new one is displayed
    this.#removeExistingContextMenu();

    // build and show on ui
    const contextMenu: HTMLElement = this.buildContextMenu();
    document.querySelector('body').append(contextMenu);


    // set the position
    const { clientX: mouseX, clientY: mouseY } = event;

    const { normalizedX, normalizedY } = this.getNormalizedPosition(mouseX, mouseY, contextMenu);

    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;

    // apply the css configurable style
    this.applyStyleOnContextMenu(
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
    super();

    this.updateOptions(configurableOptions);

    // bind the required event listeners
    this.options.scope.oncontextmenu = this.#onShowContextMenu;

    // add a click event listener to create a modal effect for the context menu and close it if the user clicks outside of it
    document.addEventListener('click', this.#onDocumentClick);
  }

  // Public methods (API)

  /**
   * Remove all the event listeners that were registered for this feature
   */
  off(): void {
    document.removeEventListener('click', this.#onDocumentClick);
    this.options.scope.oncontextmenu = null;
  }
}
