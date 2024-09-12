import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';

const Profile = () => {
  const [user, setUser] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: ''
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axiosInstance.get('/budget/api/user-profile/');
        setUser(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put('/budget/api/user-profile/', user);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Профиль пользователя</h2>
      {isEditing ? (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="username"
            value={user.username}
            onChange={handleInputChange}
            placeholder="Аккаунт пользователя"
            style={styles.input}
          />
          <input
            type="email"
            name="email"
            value={user.email}
            onChange={handleInputChange}
            placeholder="Email"
            style={styles.input}
          />
          <input
            type="text"
            name="first_name"
            value={user.first_name}
            onChange={handleInputChange}
            placeholder="Имя"
            style={styles.input}
          />
          <input
            type="text"
            name="last_name"
            value={user.last_name}
            onChange={handleInputChange}
            placeholder="Фамилия"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Сохранить</button>
        </form>
      ) : (
        <div style={styles.profileInfo}>
          <p><strong>Аккаунт пользователя:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Имя:</strong> {user.first_name}</p>
          <p><strong>Фамилия:</strong> {user.last_name}</p>
          <button onClick={() => setIsEditing(true)} style={styles.button}>Редактировать</button>
        </div>
      )}
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
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  input: {
    padding: '10px',
    backgroundColor: '#2C2C2C',
    border: '1px solid #FFD700',
    borderRadius: '4px',
    color: '#FFFFFF',
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
  profileInfo: {
    backgroundColor: '#2C2C2C',
    padding: '20px',
    borderRadius: '8px',
  },
};

export default Profile;