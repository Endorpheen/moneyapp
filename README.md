# MoneyApp: Personal Finance Tracker

## Description
MoneyApp is a full-stack web application for managing personal finances, built with a Django REST Framework backend and a React frontend.

## Features
- **User Authentication with JWT**
- **CRUD Operations for Transactions and Categories**
- **Dashboard with Financial Overview**
- **RESTful API for Seamless Data Management**

## Tech Stack
- **Backend:** Django, Django REST Framework
- **Frontend:** React, Axios
- **Database:** SQLite
- **Authentication:** JWT

## Installation

### For Development (Test) Build

#### Without Docker

1. **Install Prerequisites:**
   - Ensure you have Python and Node.js installed on your machine.
   - Install Git if you haven’t already.

2. **Clone the Repository:**
   - Open a command line or PowerShell and execute:
     ```bash
     git clone https://github.com/Endorpheen/MoneyApp.git
     cd MoneyApp
     ```

3. **Set Up the Backend:**
   - Navigate to the backend directory:
     ```bash
     cd backend
     ```
   - Install the required packages:
     ```bash
     pip install -r requirements.txt
     ```
   - Apply database migrations:
     ```bash
     python manage.py migrate
     ```
   - Create a superuser for Django admin:
     ```bash
     python manage.py createsuperuser
     ```
   - Start the backend server:
     ```bash
     python manage.py runserver  # The backend will run on http://localhost:8000
     ```

4. **Set Up the Frontend:**
   - Navigate to the frontend directory:
     ```bash
     cd ../frontend
     ```
   - Install the required packages:
     ```bash
     npm install
     ```
   - Start the frontend server:
     ```bash
     npm start  # The frontend will run on http://localhost:3000
     ```

#### With Docker

1. **Install Docker:**
   - Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/). Ensure you select the Docker image for Windows.

2. **Create a Directory for the Application:**
   - Create a separate folder on your computer where the project will reside (e.g., `MoneyApp`).

3. **Open PowerShell in the Desired Directory:**
   - Navigate to the `MoneyApp` folder in Windows Explorer, right-click in an empty space, and select "Open PowerShell here."

4. **Clone the Repository:**
   - In the opened PowerShell window, enter the following commands:
     ```bash
     git clone https://github.com/Endorpheen/MoneyApp.git
     cd MoneyApp
     ```

5. **Run the Application Using Docker:**
   - While in the project directory, execute:
     ```bash
     docker compose up --build
     ```
   - This command will create and start the necessary containers. The backend will be available at [http://localhost:8000](http://localhost:8000), and the frontend at [http://localhost:3002](http://localhost:3002).

6. **Run Database Migrations:**
   - Open a new PowerShell window and execute the following command to apply database migrations:
     ```bash
     docker compose exec backend python manage.py migrate
     ```

7. **Create a Superuser:**
   - To create a superuser, enter the following command in the new PowerShell window:
     ```bash
     docker compose exec backend python manage.py createsuperuser
     ```
   - Follow the prompts in the terminal to enter the superuser credentials.

8. **Access the Application:**
   - You can now access the backend at [http://localhost:8000](http://localhost:8000) and the frontend at [http://localhost:3002](http://localhost:3002).
   - Use the superuser credentials you just created to log in.

9. **Managing Categories and Users:**
   - To modify your budget categories, you need to do this through the backend.
   - The backend also allows you to add new users, edit transactions, and manage budgets.

10. **Stopping Containers:**
    - To stop the application, run:
      ```bash
      docker compose down
      ```

11. **Restarting After Stopping:**
    - To restart the application after stopping it, simply run:
      ```bash
      docker compose up
      ```
    - If you need to rebuild the containers considering changes, use:
      ```bash
      docker compose up --build
      ```

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

