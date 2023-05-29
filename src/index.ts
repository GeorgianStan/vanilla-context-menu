import style from './index.scss';

class VanillaContextMenu extends HTMLElement {
  #shadow: ShadowRoot;

  constructor() {
    super();
    this.#shadow = this.attachShadow({ mode: 'open' });
    style.use({ target: this.#shadow });
  }
}

customElements.define('vanilla-context-menu', VanillaContextMenu);
