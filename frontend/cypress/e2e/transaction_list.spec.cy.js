describe('Transaction List E2E Test', () => {
  
    beforeEach(() => {
      // Авторизация
      cy.visit('http://localhost:3002/login');
      cy.get('input[name="username"]').type('CYPRESS_USERNAME');
      cy.get('input[name="password"]').type('CYPRESS_PASSWORD');
      cy.get('button[type="submit"]').click();
      cy.url().should('include', '/dashboard');
  
      // Переход на страницу списка транзакций
      cy.visit('http://localhost:3002/transactions');
    });
  
    it('should display transaction list', () => {
      // Проверяем, что заголовок "Список транзакций" отображается
      cy.contains('Список транзакций').should('be.visible');
  
      // Проверяем наличие транзакций в списке
      cy.get('.transaction-item').should('have.length.greaterThan', 0);
    });
  
    it('should filter transactions by description', () => {
      // Вводим фильтр
      cy.get('input[placeholder="Фильтр"]').type('Тестовая транзакция');
  
      // Проверяем, что отображается только соответствующая транзакция
      cy.contains('Тестовая транзакция').should('be.visible');
    });
  
    it('should sort transactions by amount', () => {
      // Кликаем по заголовку столбца "Сумма" для сортировки
      cy.contains('Сумма').click();

      cy.get('.transaction-item').then(($items) => {
        const amounts = [...$items].map((item) => {
          // Извлекаем сумму из третьей колонки
          const amountText = item.querySelector('td:nth-child(3)').textContent.trim();
          
          // Выводим значение перед конвертацией
          console.log('Original amount text:', amountText);
          
          const amount = parseFloat(amountText.replace(/\s+₽/g, '').replace(/\s/g, '').replace(',', '.'));
          
          // Выводим значение после конвертации в число
          console.log('Parsed amount:', amount);
          
          return amount;
        });
        
        // Проверим, что суммы отсортированы по возрастанию
        const isSortedAsc = amounts.every((val, i, arr) => !i || arr[i - 1] <= val);
        console.log('Is sorted ascending?', isSortedAsc);
        expect(isSortedAsc).to.be.true;

        // Кликаем ещё раз на заголовок столбца "Сумма", чтобы сортировать по убыванию
        cy.contains('Сумма').click();

        // Ждём, чтобы сортировка завершилась
        cy.wait(500);

        // Проверяем сортировку по убыванию
        cy.get('.transaction-item').then(($newItems) => {
          const newAmounts = [...$newItems].map((item) => {
            const amountText = item.querySelector('td:nth-child(3)').textContent.trim();
            
            console.log('Original amount text (after click):', amountText);
            
            const amount = parseFloat(amountText.replace(/\s+₽/g, '').replace(/\s/g, '').replace(',', '.'));
            
            console.log('Parsed amount (after click):', amount);
            
            return amount;
          });

          // Проверим, что суммы отсортированы по убыванию
          const isSortedDesc = newAmounts.every((val, i, arr) => !i || arr[i - 1] >= val);
          console.log('Is sorted descending after second click?', isSortedDesc);
          expect(isSortedDesc).to.be.true;
        });
      });
    });
});
