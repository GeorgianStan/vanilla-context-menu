const URL = 'http://127.0.0.1:5500/demo/index.html';

describe('My First Test', () => {
  it('Should work as expected', () => {
    cy.visit(URL);
  });
});
