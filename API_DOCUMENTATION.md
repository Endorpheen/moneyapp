# API Documentation

## Authentication
All endpoints require authentication using JWT (JSON Web Tokens).

### Login
- **URL**: `/budget/api/login/`
- **Method**: `POST`
- **Data**: `{ "username": "string", "password": "string" }`
- **Success Response**: `{ "refresh": "string", "access": "string" }`

### Refresh Token
- **URL**: `/budget/api/token/refresh/`
- **Method**: `POST`
- **Data**: `{ "refresh": "string" }`
- **Success Response**: `{ "access": "string" }`

## Dashboard
- **URL**: `/budget/api/dashboard/`
- **Method**: `GET`
- **Success Response**:
  ```json
  {
    "income": float,
    "expenses": float,
    "balance": float,
    "recent_transactions": [
      {
        "id": integer,
        "amount": float,
        "date": "YYYY-MM-DD",
        "description": "string",
        "category": {
          "name": "string",
          "type": "string"
        }
      }
    ],
    "budgets": [
      {
        "id": integer,
        "category": "string",
        "amount": float,
        "period": "string"
      }
    ]
  }
  ```

## Transactions
### List/Create Transactions
- **URL**: `/budget/api/transactions/`
- **Methods**: `GET`, `POST`
- **GET Query Parameters**:
  - `category`: Filter by category name
  - `date_from`: Filter by start date (YYYY-MM-DD)
  - `date_to`: Filter by end date (YYYY-MM-DD)
- **POST Data**:
  ```json
  {
    "amount": float,
    "date": "YYYY-MM-DD",
    "description": "string",
    "category_id": integer
  }
  ```
- **Success Response**: List of transaction objects or created transaction object

### Retrieve/Update/Delete Transaction
- **URL**: `/budget/api/transactions/<int:pk>/`
- **Methods**: `GET`, `PUT`, `DELETE`
- **Success Response**: Transaction object

## Categories
### List/Create Categories
- **URL**: `/budget/api/categories/`
- **Methods**: `GET`, `POST`
- **POST Data**: `{ "name": "string", "type": "income|expense" }`
- **Success Response**: List of category objects or created category object

### Retrieve/Update/Delete Category
- **URL**: `/budget/api/categories/<int:pk>/`
- **Methods**: `GET`, `PUT`, `DELETE`
- **Success Response**: Category object

## Budgets
### List/Create Budgets
- **URL**: `/budget/api/budgets/`
- **Methods**: `GET`, `POST`
- **POST Data**: `{ "category": integer, "amount": float, "period": "string" }`
- **Success Response**: List of budget objects or created budget object

### Retrieve/Update/Delete Budget
- **URL**: `/budget/api/budgets/<int:pk>/`
- **Methods**: `GET`, `PUT`, `DELETE`
- **Success Response**: Budget object

## User Profile
- **URL**: `/budget/api/user-profile/`
- **Method**: `GET`
- **Success Response**: `{ "username": "string", "email": "string" }`

## Statistics
- **URL**: `/budget/api/statistics/`
- **Method**: `GET`
- **Success Response**:
  ```json
  {
    "total_income": float,
    "total_expenses": float,
    "savings_rate": float
  }
  ```

## Export Data
- **URL**: `/budget/api/export-data/`
- **Method**: `GET`
- **Success Response**: JSON object with user's transactions, categories, and budgets

## Import Data
- **URL**: `/budget/api/import-data/`
- **Method**: `POST`
- **Note**: Implementation pending