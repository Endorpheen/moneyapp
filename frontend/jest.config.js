module.exports = {
  testEnvironment: 'jsdom',  // Убираем поле preset
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!axios)', // Разрешаем Jest трансформировать axios и другие ESM библиотеки
  ],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less)$': 'identity-obj-proxy', // Маппинг стилей для тестирования
  },
  moduleFileExtensions: ['js', 'jsx'],
};
