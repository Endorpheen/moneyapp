// Импортируем необходимые утилиты для тестирования
import '@testing-library/jest-dom/extend-expect';

// Мокируем localStorage перед каждым тестом
beforeEach(() => {
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});
