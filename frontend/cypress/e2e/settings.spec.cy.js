// cypress/integration/settings.spec.js

describe('Settings E2E Test', () => {
    beforeEach(() => {
      // Авторизация
      cy.visit('http://localhost:3002/login');
      cy.get('input[name="username"]').type('CYPRESS_USERNAME');
      cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
  
      // Переход на страницу настроек
      cy.visit('http://localhost:3002/settings');
    });
  
    it('should display current settings', () => {
      // Проверяем, что настройки отображаются
      cy.contains('Настройки').should('be.visible');
      cy.get('input[name="notifications_enabled"]').should('be.visible');
    });
  
    it('should save settings successfully', () => {
      // Изменяем настройку уведомлений
      cy.get('input[name="notifications_enabled"]').uncheck(); // Отключаем уведомления
  
      // Сохраняем настройки
      cy.contains('Сохранить настройки').click();
  
      // Проверяем, что отображается сообщение об успешном сохранении
      cy.contains('Настройки успешно сохранены').should('be.visible');
    });
  
    it('should handle errors when saving settings', () => {
      // Имитация ошибки API
      cy.intercept('PUT', '/budget/api/user-settings/', {
        statusCode: 500,
        body: { error: 'Ошибка при сохранении настроек' },
      });
  
      // Изменяем настройку уведомлений
      cy.get('input[name="notifications_enabled"]').uncheck(); // Отключаем уведомления
  
      // Сохраняем настройки
      cy.contains('Сохранить настройки').click();
  
      // Проверяем, что отображается сообщение об ошибке
      cy.contains('Ошибка при сохранении настроек').should('be.visible');
    });
  });
  