/**
 * * Base & Template * Style
 */
import style from './index.scss';
import template from './index.pug';

/**
 * * Types
 */
import { DefaultOptions, MenuItem, Options } from './@types/interface';

interface State {
  style: any;
  menuItems: MenuItem[];
}

export default class VanillaContextMenu {
  // * private vars
  #state: State = { style, menuItems: [] };
  #defaultOptions: DefaultOptions = {};

  //@ts-ignore
  #options: Options = {};

  /**
   * * Private methods
   */

  /**
   * * Interpolate the state variables inside the pug element and create an HTML Element
   */
  #buildContextMenu = (): HTMLElement => {
    const wrapper: HTMLElement = document.createElement('div');
    wrapper.innerHTML = template(this.#state);

    const contextMenu: HTMLElement = wrapper.children[0] as HTMLElement;

    return contextMenu;
  };

  /**
   * * Normalize the context menu position so that it won't get out of bounds
   * @param mouseX
   * @param mouseY
   * @param contextMenu
   */
  #normalizePozition = (
    mouseX: number,
    mouseY: number,
    contextMenu: HTMLElement,
  ): { normalizedX: number; normalizedY: number } => {
    const scope: HTMLElement = this.#options.scope;

    // ? compute what is the mouse position relative to the container element (scope)
    const {
      left: scopeOffsetX,
      top: scopeOffsetY,
    } = scope.getBoundingClientRect();

    const scopeX: number = mouseX - scopeOffsetX;
    const scopeY: number = mouseY - scopeOffsetY;

    // ? check if the element will go out of bounds
    const outOfBoundsOnX: boolean =
      scopeX + contextMenu.clientWidth > scope.clientWidth;

    const outOfBoundsOnY: boolean =
      scopeY + contextMenu.clientHeight > scope.clientHeight;

    let normalizedX: number = mouseX;
    let normalizedY: number = mouseY;

    // ? normalzie on X
    if (outOfBoundsOnX) {
      normalizedX = scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
    }

    // ? normalize on Y
    if (outOfBoundsOnY) {
      normalizedY =
        scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
    }

    return { normalizedX, normalizedY };
  };

  #removeExistingContextMenu = () => {
    document.querySelector(`.${style['context-menu']}`)?.remove();
  };

  // *
  #onShowContextMenu = (event: MouseEvent) => {
    event.preventDefault();

    this.#removeExistingContextMenu();

    const contextMenu: HTMLElement = this.#buildContextMenu();
    document.querySelector('body').append(contextMenu);

    const { clientX: mouseX, clientY: mouseY } = event;

    const { normalizedX, normalizedY } = this.#normalizePozition(
      mouseX,
      mouseY,
      contextMenu,
    );

    contextMenu.style.top = `${normalizedY}px`;
    contextMenu.style.left = `${normalizedX}px`;
  };

  /**
   * * Used to determine if the user has clicked outside of the context menu and if so to close it
   * @param event
   */
  #onDocumentClick = (event: MouseEvent) => {
    const clickedTarget: HTMLElement = event.target as HTMLElement;

    if (clickedTarget.closest(`.${style['context-menu']}`)) {
      return;
    }
    this.#removeExistingContextMenu();
  };

  constructor(options: Options) {
    // ? extend default options and bind the menu items inside the state for pug template
    Object.assign(this.#options, options);

    this.#state.menuItems = this.#options.menuItems;

    // ? bind the required event listeners
    this.#options.scope.oncontextmenu = this.#onShowContextMenu;

    // ? add a click event listener to create a modal effect for the context menu and close it if the user clicks outside of it
    document.addEventListener('click', this.#onDocumentClick);
  }
}
