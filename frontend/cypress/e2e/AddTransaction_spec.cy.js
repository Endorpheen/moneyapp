// cypress/integration/add_transaction.spec.js

describe('Add Transaction E2E Test', () => {
    beforeEach(() => {
      // Авторизация
      cy.visit('http://localhost:3002/login');
      cy.get('input[name="username"]').type('CYPRESS_USERNAME');
      cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
  
      // Переход на страницу добавления транзакции
      cy.visit('http://localhost:3002/add-transaction');
    });
  
    it('should load categories', () => {
      // Проверяем, что селектор категорий загружен
      cy.intercept('GET', '/budget/api/categories/').as('getCategories');
      cy.wait('@getCategories');
  
      // Проверяем, что категории загружены и выбрана первая категория по умолчанию
      cy.get('select[name="category"]').should('have.value', '1');
    });
  
    it('should handle input changes', () => {
      // Вводим данные в поля формы
      cy.get('input[name="amount"]').type('500');
      cy.get('input[name="date"]').type('2024-09-10');
      cy.get('input[name="description"]').type('Test transaction');
      cy.get('select[name="category"]').select('Продукты'); // Измените на фактическое название категории
  
      // Проверяем, что введенные значения отображаются правильно
      cy.get('input[name="amount"]').should('have.value', '500');
      cy.get('input[name="date"]').should('have.value', '2024-09-10');
      cy.get('input[name="description"]').should('have.value', 'Test transaction');
      cy.get('select[name="category"]').should('have.value', '1'); // Проверьте, что значение категории правильное
    });
  
    it('should show error if category is not selected', () => {
        // Заполняем все поля, кроме категории
        cy.get('input[name="amount"]').type('500');
        cy.get('input[name="date"]').type('2024-09-10');
        cy.get('input[name="description"]').type('Test transaction');
      
        // Сбрасываем категорию вручную (если категория выбрана по умолчанию)
        cy.get('select[name="category"]').invoke('val', '').trigger('change');
      
        // Отправляем форму
        cy.get('button[type="submit"]').click();
      
        // Проверяем, что отображается сообщение об ошибке
        cy.contains('Пожалуйста, выберите категорию').should('be.visible');
      });
      
      
  
    it('should submit the transaction form successfully', () => {
      // Заполняем форму корректными данными
      cy.get('input[name="amount"]').type('500');
      cy.get('input[name="date"]').type('2024-09-10');
      cy.get('input[name="description"]').type('Test transaction');
      cy.get('select[name="category"]').select('Продукты');
  
      // Имитация успешного добавления транзакции через API
      cy.intercept('POST', '/budget/api/transactions/', {
        statusCode: 201,
        body: { message: 'Транзакция успешно добавлена' }
      }).as('postTransaction');
  
      // Отправляем форму
      cy.get('button[type="submit"]').click();
  
      // Проверяем, что транзакция добавлена и toast-уведомление появилось
      cy.wait('@postTransaction');
      cy.contains('Транзакция успешно добавлена').should('be.visible');
    });
  
    it('should handle API errors when submitting', () => {
      // Заполняем форму
      cy.get('input[name="amount"]').type('500');
      cy.get('input[name="date"]').type('2024-09-10');
      cy.get('input[name="description"]').type('Test transaction');
      cy.get('select[name="category"]').select('Продукты');
  
      // Имитация ошибки API
      cy.intercept('POST', '/budget/api/transactions/', {
        statusCode: 500,
        body: { error: 'Ошибка при добавлении транзакции' }
      }).as('postTransactionError');
  
      // Отправляем форму
      cy.get('button[type="submit"]').click();
  
      // Проверяем, что отображается сообщение об ошибке
      cy.wait('@postTransactionError');
      cy.contains('Ошибка при добавлении транзакции').should('be.visible');
    });
  });
  