import menuSheet from './menu.scss';
import { normalizePosition } from './util';

type TOKEN_KEYS =
  | 'trigger-attr'
  | 'menu-selector'
  | 'options-attr'
  | 'style-attr'
  | 'option-id';

const TOKENS = new Map<TOKEN_KEYS, string>([
  ['trigger-attr', 'vanilla-context-menu-trigger'], // Attribute selector used for context menu triggers.
  ['menu-selector', 'vanilla-menu'], // HTML tag for the element that will be created when the context menu event is triggered.
  ['options-attr', 'options'], // The attribute selector for the wrapper in which the options are declared.
  ['style-attr', 'style'], // The attribute selector for the wrapper in which the style tag is declared.
  ['option-id', 'optionId'], // The attribute selector for the wrapper in which the style tag is declared.
]);

class Menu extends HTMLElement {
  // private properties
  #shadow: ShadowRoot;
  #styleLoaded = false;

  // public properties
  id!: string;
  parentOwner!: VanillaContextMenu;

  set options(optionsContent: ChildNode[]) {
    this.#shadow.append(...optionsContent);
  }

  /** Return the actual options of the menu by omitting  he <style> element and the nodes that are not of type ELEMENT_NODE(s). */
  get options(): ChildNode[] {
    return Array.from(this.#shadow.childNodes).filter(
      ({ nodeName, nodeType, ELEMENT_NODE }) =>
        nodeType === ELEMENT_NODE && nodeName !== 'STYLE'
    );
  }

  set styleTag(styleContent: Node | undefined) {
    if (!styleContent) {
      this.#styleLoaded = true;
      return;
    }

    this.#shadow.prepend(styleContent);

    // If it's an exeternal link set a flag to true when it's loaded.
    const externalLinks = Array.from(this.#shadow.querySelectorAll('link'));

    if (!externalLinks.length) {
      this.#styleLoaded = true;
      return;
    }

    let linksLoaded = 0;

    externalLinks.forEach(
      (link) =>
        (link.onload = () => {
          linksLoaded++;
          linksLoaded === externalLinks.length && (this.#styleLoaded = true);
        })
    );
  }

  // private methods
  #registerClickEvents() {
    // Get an array of clickable options. The clickable elements are the ones that don't have a listener already registered with 'onclick' and have content.
    // The options are ELEMENT_NODES, therefore this casting is safe.
    const clickableOptions = (this.options as HTMLElement[]).filter(
      (option) => !option.onclick && Boolean(option.innerHTML)
    );

    // For clickable options register a new 'onclick' handler.
    clickableOptions.forEach((option, i) => {
      option.onclick = () => {
        const clickedOption =
          option.dataset[TOKENS.get('option-id') as string] ?? i;
        this.parentOwner.onMenuOptionSelected(clickedOption);
      };
    });

    // For the options that already have 'onclick' handler registeerd, then monkey-patch the existing handler.
    (this.options as HTMLElement[])
      .filter((option) => option.onclick)
      .forEach((option) => {
        const cb = option.onclick as NonNullable<typeof option.onclick>;

        option.onclick = (ev: MouseEvent) => {
          cb.call(window, ev);
          this.remove();
        };
      });
  }

  // public methods
  /** Promise that uses the `#styleLoaded` flag to check if the external stylesheet was loaded and it resolves when the flag is true. */
  async waitForStyle() {
    return new Promise<void>((resolve) => {
      const checkFlag = () => {
        if (this.#styleLoaded) {
          return resolve();
        }

        setTimeout(checkFlag, 100);
      };
      checkFlag();
    });
  }

  // life-cycle methods
  constructor() {
    super();

    this.#shadow = this.attachShadow({ mode: 'open' });

    // Append the style tag using the style-loader's configuration defined in webpack.config.js.
    this.#shadow.adoptedStyleSheets = [menuSheet];
  }

  connectedCallback() {
    // Set an unique id on this element.
    this.setAttribute('id', (this.id = crypto.randomUUID()));

    // Add the hidden class that is used to wait for the external style to load.
    this.classList.add('hidden');

    this.#registerClickEvents();
  }
}

class VanillaContextMenu extends HTMLElement {
  // private properties
  #menu: Menu | undefined;
  #menuTriggers: HTMLElement[];

  // private methods
  async #_onContextMenu(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    // Remove existing menu if any.
    this.#menu && this.#menu.remove();

    // Build the menu and pass the options and the style.
    const optionsContent = (
      this.querySelector(`[${TOKENS.get('options-attr')}]`) as
        | HTMLTemplateElement
        | undefined
    )?.content.cloneNode(true);

    const styleContent = (
      this.querySelector(`[${TOKENS.get('style-attr')}]`) as
        | HTMLTemplateElement
        | undefined
    )?.content.cloneNode(true);

    this.#menu = document.createElement(
      TOKENS.get('menu-selector') as string
    ) as Menu;

    optionsContent &&
      (this.#menu.options = Array.from(optionsContent.childNodes));

    this.#menu.styleTag = styleContent;
    this.#menu.parentOwner = this;

    // The menu needs to be added to the DOM so that its position can be normalized according to its size.
    document.body.append(this.#menu);

    await this.#menu.waitForStyle();
    this.#menu.classList.remove('hidden');

    // Compute the position of the menu so that it fits inside the viewport.
    const { clientX, clientY } = event;
    const { normalizedX, normalizedY } = normalizePosition(
      { clientX, clientY },
      this.#menu
    );

    this.#menu.style.top = `${normalizedY}px`;
    this.#menu.style.left = `${normalizedX}px`;

    // Disable contextmenu event.
    this.#menu.oncontextmenu = (e) => e.preventDefault();
  }

  // To remove and event listener, the same options that were send to 'addEventListener' functions must be send. Since 'bind' creates a new function, it's necessary to store the reference to this new function in a variable.
  #onContextMenu: (event: MouseEvent) => void = this.#_onContextMenu.bind(this);

  /** Determine if a click event was triggered outside of the context menu and if so, remove it. */
  #onDocumentClick = (event: MouseEvent): void => {
    if (!this.#menu) {
      return;
    }

    const clickedTarget = event.target as HTMLElement;

    if (clickedTarget.closest(`[id='${this.#menu.id}']`)) {
      return;
    }

    this.#menu && this.#menu.remove();
  };

  /** Return an array of HTML elements that act as triggers and will open the menu when the contextmenu event is dispatched on them. */
  get #triggers(): HTMLElement[] {
    const parent = this.parentElement as HTMLElement;

    const triggers = Array.from(
      parent.querySelectorAll(`[${TOKENS.get('trigger-attr')}]`)
    ) as HTMLElement[];

    return triggers.length ? triggers : [parent];
  }

  // life-cycle methods
  constructor() {
    super();

    this.#menuTriggers = this.#triggers;

    // Add click event on each menu trigger to open the contextmenu.
    this.#menuTriggers.forEach((trigger) =>
      trigger.addEventListener('contextmenu', this.#onContextMenu)
    );

    // Add a click event listener to create a modal effect for the menu and remove it if a click event is triggered outside of it.
    document.addEventListener('click', this.#onDocumentClick);
  }

  disconnectedCallback() {
    // Cleanup login when the custom element is removed from the DOM.
    this.#menuTriggers.forEach((trigger) =>
      trigger.removeEventListener('contextmenu', this.#onContextMenu)
    );
    document.removeEventListener('click', this.#onDocumentClick);

    this.#menu && this.#menu.remove();
  }

  // public methods
  /** This method is called by the inner menu when an option is selected. */
  onMenuOptionSelected(optionId: string | number) {
    (this.#menu as Menu).remove();

    this.dispatchEvent(
      new CustomEvent('selection-change', { detail: optionId })
    );
  }
}

customElements.define(TOKENS.get('menu-selector') as string, Menu);
customElements.define('vanilla-context-menu', VanillaContextMenu);
