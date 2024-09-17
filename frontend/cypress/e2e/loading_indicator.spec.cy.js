// cypress/integration/loading_indicator.spec.js

describe('Loading Indicator Test', () => {
    beforeEach(() => {
      // Авторизация
      cy.visit('http://localhost:3002/login');
      cy.get('input[name="username"]').type('CYPRESS_USERNAME');
      cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  
    it('should display loading indicator while data is loading', () => {
      // Имитация задержки загрузки данных
      cy.intercept('GET', '/budget/api/dashboard/', (req) => {
        req.on('response', (res) => {
          res.setDelay(1000); // Задержка в 1 секунду
        });
      });
  
      // Переходим на дашборд
      cy.visit('http://localhost:3002/dashboard');
  
      // Проверяем, что индикатор загрузки виден
      cy.contains('Загрузка').should('be.visible');
  
      // Проверяем, что индикатор загрузки исчезает после загрузки данных
      cy.contains('Загрузка').should('not.exist');
    });
  });
  