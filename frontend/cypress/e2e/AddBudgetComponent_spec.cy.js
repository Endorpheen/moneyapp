describe('Add Budget E2E Test', () => {
    beforeEach(() => {
      // Авторизация
      cy.visit('http://localhost:3002/login');
      cy.get('input[name="username"]', { timeout: 10000 }).type('CYPRESS_USERNAME');
      cy.get('input[name="password"]', { timeout: 10000 }).type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
  
      // Переход на страницу добавления бюджета
      cy.visit('http://localhost:3002/add-budget');
    });
  
    it('should load categories and users', () => {
      // Проверяем, что селекторы категорий и пользователей загружены
      cy.contains('Категория').should('be.visible');
      cy.contains('Пользователь').should('be.visible');
  
      // Проверяем наличие опций в селектах
      cy.get('select[name="category"]').children().should('have.length.greaterThan', 1);
      cy.get('select[name="user"]').children().should('have.length.greaterThan', 1);
    });
  
    it('should handle input changes', () => {
      // Выбираем категорию
      cy.get('select[name="category"]').select('Продукты');
  
      // Вводим сумму
      cy.get('input[name="amount"]').type('1000');
  
      // Выбираем даты
      cy.get('input[name="start_date"]').type('2024-10-01');
      cy.get('input[name="end_date"]').type('2024-11-01');
  
      // Выбираем пользователя
      cy.get('select[name="user"]').select('end0');
  
      // Проверяем введенные значения
      cy.get('select[name="category"]').should('have.value', '1'); // Предполагается, что ID категории 'Продукты' равен 1
      cy.get('input[name="amount"]').should('have.value', '1000');
      cy.get('input[name="start_date"]').should('have.value', '2024-10-01');
      cy.get('input[name="end_date"]').should('have.value', '2024-11-01');
      cy.get('select[name="user"]').should('have.value', 'end0');
    });
  
    it('should submit the budget form successfully', () => {
      // Заполняем форму
      cy.get('select[name="category"]').select('Продукты');
      cy.get('input[name="amount"]').type('1000');
      cy.get('input[name="start_date"]').type('2024-10-01');
      cy.get('input[name="end_date"]').type('2024-11-01');
      cy.get('select[name="user"]').select('end0');
  
      // Отправляем форму через явное указание на кнопку
      cy.get('button').contains('Добавить бюджет').click();
  
      // Отслеживаем alert через глобальный объект window
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Бюджет успешно добавлен!');
      });
    });
  
    it('should show an error message if the API returns an error', () => {
      // Имитация ошибки API
      cy.intercept('POST', '/budget/api/budgets/', {
        statusCode: 500,
        body: { error: 'Ошибка при добавлении бюджета' },
      }).as('addBudgetError');
  
      // Заполняем форму
      cy.get('select[name="category"]').select('Продукты');
      cy.get('input[name="amount"]').type('1000');
      cy.get('input[name="start_date"]').type('2024-10-01');
      cy.get('input[name="end_date"]').type('2024-11-01');
      cy.get('select[name="user"]').select('end0');
  
      // Отправляем форму через явное указание на кнопку
      cy.get('button').contains('Добавить бюджет').click();
  
      // Проверяем, что ошибка отображается через alert
      cy.on('window:alert', (text) => {
        expect(text).to.contains('Ошибка при добавлении бюджета');
      });
    });
  });
  