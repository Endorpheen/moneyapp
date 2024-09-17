// cypress/integration/profile.spec.js

describe('Profile E2E Test', () => {
    beforeEach(() => {
      // Авторизация
      cy.visit('http://localhost:3002/login');
      cy.get('input[name="username"]').type('CYPRESS_USERNAME');
      cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
  
      // Переход на страницу профиля
      cy.visit('http://localhost:3002/profile');
    });
  
    it('should display user profile information', () => {
      // Проверяем, что данные профиля отображаются
      cy.contains('Аккаунт пользователя:').should('be.visible');
      cy.contains('Igor').should('be.visible');
      cy.contains('endorfeen23@gmail.com').should('be.visible'); // Замените на ваш email
    });
  
    it('should allow editing and saving profile information', () => {
      // Переходим в режим редактирования
      cy.contains('Редактировать').click();
  
      // Изменяем имя
      cy.get('input[name="first_name"]').clear().type('UpdatedName');
  
      // Сохраняем изменения
      cy.contains('Сохранить').click();
  
      // Проверяем, что данные обновились
      cy.contains('UpdatedName').should('be.visible');
    });
  
    it('should show an error when the profile update fails', () => {
        // Имитация ошибки API
        cy.intercept('PUT', '/budget/api/user-profile/', {
          statusCode: 500,
          body: { error: 'Ошибка при обновлении профиля' },
        });
      
        // Переходим в режим редактирования
        cy.contains('Редактировать').click();
      
        // Изменяем имя
        cy.get('input[name="first_name"]').clear().type('ErrorName');
      
        // Сохраняем изменения
        cy.contains('Сохранить').click();
      
        // Проверяем, что отображается сообщение об ошибке
        cy.contains('Ошибка при обновлении профиля').should('be.visible');
      });      
  });
  