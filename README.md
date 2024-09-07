# MoneyApp: Personal Finance Tracker

## Description
A full-stack web application for managing personal finances. Built with Django REST Framework backend and React frontend.

## Features
- **User Authentication with JWT**
- **CRUD Operations for Transactions and Categories**
- **Dashboard with Financial Overview**
- **RESTful API for Seamless Data Management**

## Tech Stack
- **Backend:** Django, Django REST Framework
- **Frontend:** React, Axios
- **Database:** PostgreSQL
- **Authentication:** JWT

## Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/MoneyApp.git
cd MoneyApp

# Set up the backend
cd backend
pip install -r requirements.txt
python manage.py migrate

# Create a superuser for Django admin
python manage.py createsuperuser

python manage.py runserver

# Set up the frontend
cd ../frontend
npm install
npm start
```

## Usage
1. **Register/Login:** Use the provided forms to register or login.
2. **Dashboard:** View your financial overview.
3. **Transactions:** Add, edit, or delete transactions.
4. **Categories:** Manage your transaction categories.

## API Documentation
Detailed documentation for API endpoints is available in the [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) file.

## Contributing
We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Open a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.