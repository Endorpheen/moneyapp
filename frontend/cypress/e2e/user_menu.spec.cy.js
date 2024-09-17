// cypress/integration/user_menu.spec.js

describe('User Menu E2E Test', () => {
    beforeEach(() => {
      // Авторизация
      cy.visit('http://localhost:3002/login');
      cy.get('input[name="username"]').type('CYPRESS_USERNAME');
      cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  
    it('should open and interact with user menu', () => {
      // Открываем меню пользователя (заменяем класс на 'user-icon')
      cy.get('.user-icon').click();
  
      // Проверяем, что пункты меню видимы
      cy.contains('Профиль').should('be.visible');
      cy.contains('Настройки').should('be.visible');
      cy.contains('Выйти').should('be.visible');
  
      // Переход на страницу профиля
      cy.contains('Профиль').click();
      cy.url().should('include', '/profile');
  
      // Возвращаемся и открываем меню снова
      cy.visit('http://localhost:3002/dashboard');
      cy.get('.user-icon').click();
  
      // Переход на страницу настроек
      cy.contains('Настройки').click();
      cy.url().should('include', '/settings');
  
      // Возвращаемся и открываем меню снова
      cy.visit('http://localhost:3002/dashboard');
      cy.get('.user-icon').click();
  
      // Выходим из аккаунта
      cy.contains('Выйти').click();
      cy.url().should('include', '/login');
    });
  });
  