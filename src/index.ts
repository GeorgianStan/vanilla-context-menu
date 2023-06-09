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
  #id: string;
  #shadow: ShadowRoot;

  #menu: Menu | undefined;
  #menuTrigger: HTMLElement;

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

  /** Determine if a click event was triggered outside of the context menu and if so, remove it. */
  #onDocumentClick = (event: MouseEvent): void => {
    const clickedTarget = event.target as HTMLElement;

    if (clickedTarget.closest(`[id='${this.#id}']`)) {
      return;
    }

    this.#menu && this.#menu.remove();
  };

  // life-cycle methods
  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });
    this.#menuTrigger = this.parentElement as HTMLElement;

    // Append the style tag using the style-loader's configuration defined in webpack.config.js.
    style.use({ target: this.#shadow });

    // Set an unique id on this element.
    this.setAttribute('id', (this.#id = crypto.randomUUID()));

    this.#menuTrigger.addEventListener('contextmenu', this.#onContextMenu);

    // Add a click event listener to create a modal effect for the menu and remove it if a click event is triggered outside of it.
    document.addEventListener('click', this.#onDocumentClick);
  }

  disconnectedCallback() {
    // Cleanup login when the custom element is removed from the DOM.
    this.#menuTrigger.removeEventListener('contextmenu', this.#onContextMenu);
    document.removeEventListener('click', this.#onDocumentClick);

    this.#menu && this.#menu.remove();
  }
}

customElements.define('vanilla-context-menu', VanillaContextMenu);
