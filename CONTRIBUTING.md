# Contributing

## Clone for development

Clone the repository and create a local branch with what you want to add:

`feature/explain_your_feature`, `fix/explain_your_fix` and so on and start writing your code.

To start the application use the following commands:

`npm ci` to install the dependencies for the toolchain

`npm run build:dev` - compile the code in watch mode with devevelopment configuration
`npm run build:prod` - build the code in production mode

Inside `demo` you will find a file `index.html` that can be used for local testing.

## Project structure

```
.
├── dist      // code output
├── src       // source code
├── test      // test files
```

## Commit rules

Please refer to [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/)
