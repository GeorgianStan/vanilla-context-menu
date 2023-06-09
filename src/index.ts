import style from './index.scss';

const TOKENS = new Map<string, string>([
  ['optionAttr', 'vanilla-context-menu-option'],
]);

class Menu {
  // private properties
  #shadow: ShadowRoot;
  #optionsContent: Node[];

  // private methods
  #showMenu() {
    const options = this.#optionsContent.map((fragment) => {
      const option = document.createElement('span');
      option.setAttribute(TOKENS.get('optionAttr'), '');
      option.append(fragment);
      return option;
    });

    this.#shadow.append(...options);
  }

  // life-cycle methods
  constructor(shadowRoot: ShadowRoot, optionsContent: Node[]) {
    this.#shadow = shadowRoot;
    this.#optionsContent = optionsContent;

    this.#showMenu();
  }

  // public methods

  /** Removes the menu that was created from the template. */
  remove() {
    this.#shadow
      .querySelectorAll(`[${TOKENS.get('optionAttr')}]`)
      .forEach((el) => el.remove());
  }
}

class VanillaContextMenu extends HTMLElement {
  // private properties
  #shadow: ShadowRoot;
  #menu: Menu | undefined;

  // private methods
  #_onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Remove existing menu if any.
    this.#menu && this.#menu.remove();

    // Set the position of the menu based on the mouse position.
    const { clientX: mouseX, clientY: mouseY } = event;
    this.style.top = `${mouseY}px`;
    this.style.left = `${mouseX}px`;

    // Get the options content and build a new menu.
    const optionsContent = Array.from(this.querySelectorAll('template')).map(
      (template) => template.content.cloneNode(true)
    );
    this.#menu = new Menu(this.#shadow, optionsContent);
  }

  // To remove and event listener, the same options that were send to 'addEventListener' functions must be send. Since 'bind' creates a new function, it's necessary to store the reference to this new function in a variable.
  #onContextMenu: (event: MouseEvent) => void = this.#_onContextMenu.bind(this);

  /** Removes the custom element and the 'contextmenu' event attached to the parent element. */
  #remove() {
    this.parentElement.removeEventListener('contextmenu', this.#onContextMenu);
    this.remove();
  }

  // life-cycle methods
  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    style.use({ target: this.#shadow });

    this.parentElement.addEventListener('contextmenu', this.#onContextMenu);
  }
}

customElements.define('vanilla-context-menu', VanillaContextMenu);
