import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { toast } from 'react-toastify';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications_enabled: false,
    dark_mode: true,
    language: 'ru'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get('/budget/api/user-settings/');
        setSettings(response.data);
      } catch (error) {
        console.error('Error fetching user settings:', error);
        toast.error('Ошибка при загрузке настроек');
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (setting) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      [setting]: !prevSettings[setting]
    }));
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setSettings(prevSettings => ({
      ...prevSettings,
      language: newLanguage
    }));
    localStorage.setItem('language', newLanguage);
  };

  const saveSettings = async () => {
    try {
      await axiosInstance.put('/budget/api/user-settings/', settings);
      toast.success('Настройки успешно сохранены');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Ошибка при сохранении настроек');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Настройки</h2>
      <div style={styles.setting}>
        <label>
          <input
            type="checkbox"
            name="notifications_enabled" // Добавлено имя
            checked={settings.notifications_enabled}
            onChange={() => handleToggle('notifications_enabled')}
          />
          Включить уведомления
        </label>
      </div>
      <div style={styles.setting}>
        <label>
          <input
            type="checkbox"
            name="dark_mode" // Добавлено имя для темной темы
            checked={settings.dark_mode}
            onChange={() => handleToggle('dark_mode')}
          />
          Темная тема
        </label>
      </div>
      <div style={styles.setting}>
        <label>
          Язык:
          <select
            value={settings.language}
            onChange={handleLanguageChange}
            style={styles.select}
          >
            <option value="ru">Русский</option>
            <option value="en">Английский</option>
          </select>
        </label>
      </div>
      <button onClick={saveSettings} style={styles.button}>Сохранить настройки</button>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#1E1E1E',
    color: '#FFFFFF',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    color: '#FFD700',
    marginBottom: '20px',
  },
  setting: {
    marginBottom: '15px',
  },
  select: {
    marginLeft: '10px',
    padding: '5px',
    backgroundColor: '#2C2C2C',
    color: '#FFFFFF',
    border: '1px solid #FFD700',
    borderRadius: '4px',
  },
  button: {
    padding: '10px',
    backgroundColor: '#FFD700',
    color: '#1E1E1E',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};

export default Settings;
