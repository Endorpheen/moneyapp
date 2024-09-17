// cypress/integration/budget_list.spec.js

describe('Budget List E2E Test', () => {
  beforeEach(() => {
    // Авторизация
    cy.visit('http://localhost:3002/login');
    cy.get('input[name="username"]').type('CYPRESS_USERNAME');
    cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Переход на страницу списка бюджетов
    cy.visit('http://localhost:3002/budgets');
  });

  it('should display budget list', () => {
    // Перехватываем запрос на получение списка бюджетов
    cy.intercept('GET', '/budget/api/budgets/').as('getBudgets');
    cy.wait('@getBudgets').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
  });

  it('should add a new budget and display it in the list', () => {
    // Вводим данные для нового бюджета
    cy.get('input[name="amount"]').should('be.visible').type('10000');
    cy.get('input[name="start_date"]').type('2024-09-13');
    cy.get('input[name="end_date"]').type('2024-09-27');
    cy.get('select[name="category"]').select('Продукты'); // Убедитесь, что такая категория существует

    // Отправляем форму
    cy.get('button[type="submit"]').click();

    // Добавляем небольшую задержку для перерисовки страницы
    cy.wait(2000); // Ждем 1 секунду, чтобы страница обновилась

    // Проверяем, что новый бюджет отображается в списке
    cy.get('.budget-item').contains('10 000,00 ₽').should('be.visible');
  });

  it('should delete a budget', () => {
    // Убедимся, что есть хотя бы один бюджет
    cy.get('.budget-item').should('have.length.greaterThan', 0);
  
    // Удаляем первый бюджет в списке
    cy.get('.budget-item').first().within(() => {
      cy.contains('Удалить').click(); // Предполагается, что есть кнопка "Удалить"
    });
  
    // Проверяем, что первый бюджет был удалён
    cy.get('.budget-item').should('have.length', 0); // Если это последний бюджет, список должен стать пустым
  });
  
});
