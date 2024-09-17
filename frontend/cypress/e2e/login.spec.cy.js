// cypress/integration/login.spec.js

describe('Login E2E Test', () => {
    beforeEach(() => {
      // Переход на страницу логина перед каждым тестом
      cy.visit('http://localhost:3002/login');
    });
  
    it('should display login form', () => {
      // Проверяем, что форма логина отображается корректно
      cy.get('input[name="username"]').should('be.visible');
      cy.get('input[name="password"]').should('be.visible');
      cy.contains('Войти').should('be.visible');
    });
  
    it('should login successfully with correct credentials', () => {
      // Ввод правильных данных
      cy.get('input[name="username"]').type('CYPRESS_USERNAME');
      cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
  
      // Проверяем, что произошла переадресация на дашборд
      cy.url().should('include', '/dashboard');
    });
  
    it('should show error message with incorrect credentials', () => {
      // Ввод неправильных данных
      cy.get('input[name="username"]').type('end0');
      cy.get('input[name="password"]').type('12345');
      cy.get('button[type="submit"]').click();
  
      // Проверяем, что выводится сообщение об ошибке
      cy.contains('Неверное имя пользователя или пароль').should('be.visible');
    });
  });
  