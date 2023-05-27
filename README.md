# Vanilla Context Menu

<div style='text-align:center'>
    <img src='https://img.shields.io/github/issues/GeorgianStan/vanilla-context-menu' alt='issues'>
    <img src='https://img.shields.io/github/forks/GeorgianStan/vanilla-context-menu' alt='forks'>
    <img src='https://img.shields.io/github/stars/GeorgianStan/vanilla-context-menu' alt='stars'>
    <img src='https://img.shields.io/github/license/GeorgianStan/vanilla-context-menu' alt='license'>
    <img src='https://img.shields.io/github/package-json/v/GeorgianStan/vanilla-context-menu?color=%237146f9&logo=javascript' alt='version'>
</div>

`vanilla-context-menu` - easily create context-menus using Vanilla JavaScript and integrate them in any web application

## Installation

### Browser CDN

```html
<script src="https://unpkg.com/vanilla-context-menu@x.y.z/dist/vanilla-context-menu.js"></script>
```

Where `@x.y.z` is the version that you want to use.

Then, anywhere in your JavaScript code, you can access the library exports with `window.VanillaContextMenu` or simply `VanillaContextMenu`.

### Via NPM

```bash
npm i vanilla-context-menu
```

Then anywhere in your code.

```javascript
import * as VanillaContextMenu from 'vanilla-context-menu';
```

### Side-effects

Importing the library will have side effects in your application:
- It will create a `style` tag with the library's **isolated** CSS rules.

## Examples

> You can check the `public` folder for more examples -- [public/index.html](https://github.com/GeorgianStan/vanilla-context-menu/blob/master/public/index.html).


## Contributing

Pull requests and stars are always welcome. Please check the [guidelines](https://github.com/GeorgianStan/vanilla-context-menu/blob/master/CONTRIBUTING.md).

## Changelog

For project updates you can also reference the [changelog](https://github.com/GeorgianStan/vanilla-context-menu/blob/master/CHANGELOG.md).

## Stay in touch

[Discussions page](https://github.com/GeorgianStan/vanilla-context-menu/discussions)

## License

This project is licensed under the [MIT License](https://github.com/GeorgianStan/vanilla-context-menu/blob/master/LICENSE)
