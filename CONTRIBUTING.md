# Contributing

## Clone for development

Clone the repository and create a local branch with what you want to add:

`feature/explain_your_feature`, `fix/explain_your_fix` and so on and start writing your code.

To start the application use the following commands:

`npm ci` to install the dependencies for the toolchain

`npm run start:dev` - compile the code in watch mode
`npm run build:prod` - build the code in production mode

## Project structure

```
.
├── dist      // code output
├── src       // source code
├── test      // test files
```

## Commit rules

### Commit message

Please include in your commit message what you changed and if required why.

It should :

- contain a short description of the change (preferably 50 characters or less)
- be prefixed with one of the following tags
  - wip(work in progress): partial implementation
  - fix : bug fix
  - feat or feature : new or updated feature
  - doc or docs : documentation updates
  - BREAKING : if commit is a breaking change
  - refactor : code refactoring (no functional change)
  - test : tests and CI updates
  - chore : updates for toolchain(webpack rules, update/upgrade dependencies and so on)

_example_: **git commit -m "feat,test: functionality to do X was implemented and tested"**

## Tests

Before pushing the updates, be sure to test them with at least one of the following `unit` or `integration`.

You can use the following commands: `npm test`, `npm test:watch`, `npm test:cov`

Before publishing, please lint the code using the `npm run lint` command.
