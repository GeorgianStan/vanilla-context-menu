import style from './index.scss';

class VanillaContextMenu extends HTMLElement {
  // private properties
  #shadow: ShadowRoot;

  // private methods
  #_onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
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
