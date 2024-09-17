// cypress/integration/dashboard_spec.cy.js

describe('Dashboard E2E Test', () => {
  beforeEach(() => {
    // Авторизация
    cy.visit('http://localhost:3002/login');
    cy.get('input[name="username"]').type('CYPRESS_USERNAME');
    cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Перехватываем запрос для данных дашборда
    cy.intercept('GET', '/budget/api/dashboard/').as('getDashboardData');
    cy.visit('http://localhost:3002/dashboard');
    cy.wait('@getDashboardData');
  });

  it('should display dashboard data', () => {
    // Проверяем, что ключевые элементы присутствуют
    cy.contains('Финансовый Дашборд').should('be.visible');
    cy.contains('Баланс').should('be.visible');
    cy.contains('Доходы').should('be.visible');
    cy.contains('Расходы').should('be.visible');

    // Проверяем, что данные отображаются правильно
    cy.get('.balance-value').should('not.be.empty'); // Проверка значения баланса
    cy.get('.income-value').should('not.be.empty'); // Проверка значения доходов
    cy.get('.expenses-value').should('not.be.empty'); // Проверка значения расходов
  });

  it('should allow adding a new transaction', () => {
    // Вводим данные для новой транзакции
    cy.get('input[name="description"]').type('Тестовая транзакция');
    cy.get('input[name="amount"]').type('500');
    cy.get('select[name="category"]').select('Продукты');
  
    // Логируем перед отправкой формы
    cy.log('Отправляем транзакцию');
  
    // Перехватим запрос на добавление транзакции
    cy.intercept('POST', '/budget/api/transactions/').as('postTransaction');
  
    // Отправляем транзакцию
    cy.get('button[type="submit"]').click();
  
    // Логируем после клика
    cy.log('Ожидание перехвата запроса');
  
    // Проверяем перехват запроса
    cy.wait('@postTransaction').then((interception) => {
      expect(interception.response.statusCode).to.equal(201);
    });
  
    // Проверим, что транзакция была добавлена
    cy.contains('Транзакция успешно добавлена').should('be.visible');
  });
  
  it('should handle API errors when fetching dashboard data', () => {
    // Перехватываем запрос и имитируем ошибку
    cy.intercept('GET', '/budget/api/dashboard/', {
      statusCode: 500,
      body: { error: 'Ошибка при загрузке данных' }
    }).as('getDashboardError');
  
    // Перезагружаем страницу
    cy.reload();
    cy.wait('@getDashboardError');
  
    // Проверяем, что отображается сообщение об ошибке
    cy.contains('Ошибка при загрузке данных').should('be.visible');
    cy.contains('Попробовать снова').should('be.visible');
  
    // Логируем перед кликом на "Попробовать снова"
    cy.log('Нажимаем "Попробовать снова"');
  
    // Клик на кнопку "Попробовать снова"
    cy.contains('Попробовать снова').click();
  
    // Перехватываем успешный запрос для данных дашборда
    cy.intercept('GET', '/budget/api/dashboard/').as('getDashboardData');
  
    // Логируем перед ожиданием перехвата
    cy.log('Ожидаем успешную загрузку данных дашборда');
  
    // Ждем успешного ответа
    cy.wait('@getDashboardData').then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
  });
});  
