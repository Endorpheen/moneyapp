# Используем официальный Node.js образ для создания React-приложения
FROM node:14-alpine

# Устанавливаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json в контейнер
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем остальные файлы приложения в контейнер
COPY . .

# Собираем React-приложение
RUN npm run build

# Устанавливаем сервер для статических файлов
RUN npm install -g serve

# Открываем порт 3002
EXPOSE 3002

# Запускаем приложение на порту 3002
CMD ["serve", "-s", "build", "-l", "3002"]
