import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import Profile from './Profile';
import axiosInstance from '../api/axiosConfig';

jest.mock('../api/axiosConfig');

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  console.error.mockRestore();
});

test('renders profile information', async () => {
  axiosInstance.get.mockResolvedValue({
    data: {
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
  });

  await act(async () => {
    render(<Profile />);
  });

  await waitFor(() => {
    expect(screen.getByText(/Аккаунт пользователя:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/testuser/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/testuser@example.com/i)).toBeInTheDocument();
  });
});

test('enables editing mode and updates profile data', async () => {
  axiosInstance.get.mockResolvedValue({
    data: {
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'Test',
      last_name: 'User',
    },
  });

  axiosInstance.put.mockResolvedValue({
    data: {
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'UpdatedName',
      last_name: 'User',
    },
  });

  await act(async () => {
    render(<Profile />);
  });

  const editButton = screen.getByText(/Редактировать/i);
  fireEvent.click(editButton);

  await waitFor(() => {
    const firstNameInput = screen.getByPlaceholderText(/Имя/i);
    expect(firstNameInput).toBeInTheDocument();
    expect(firstNameInput.value).toBe('Test');

    fireEvent.change(firstNameInput, { target: { value: 'UpdatedName' } });
    expect(firstNameInput.value).toBe('UpdatedName');
  });

  const saveButton = screen.getByText(/Сохранить/i);
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(axiosInstance.put).toHaveBeenCalledWith('/budget/api/user-profile/', {
      username: 'testuser',
      email: 'testuser@example.com',
      first_name: 'UpdatedName',
      last_name: 'User',
    });
  });
});

test('handles API errors when fetching or updating profile', async () => {
  axiosInstance.get.mockRejectedValue(new Error('Ошибка загрузки профиля'));

  await act(async () => {
    render(<Profile />);
  });

  await waitFor(() => {
    expect(axiosInstance.get).toHaveBeenCalledWith('/budget/api/user-profile/');
    expect(console.error).toHaveBeenCalledWith('Error fetching user data:', expect.any(Error));
  });
});
