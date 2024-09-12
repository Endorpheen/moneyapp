import React from 'react';
import { render, screen } from '@testing-library/react';
import Loading from './Loading';
import '@testing-library/jest-dom/extend-expect';


describe('Loading component', () => {
  test('renders loading spinner and text', () => {
    render(<Loading />);

    // Проверка на наличие элемента с классом "loading-spinner"
    const spinner = screen.getByRole('status'); // используем роль status для спиннера
    expect(spinner).toBeInTheDocument();

    // Проверка на наличие текста "Загрузка..."
    const loadingText = screen.getByText(/Загрузка/i);
    expect(loadingText).toBeInTheDocument();
  });
});
