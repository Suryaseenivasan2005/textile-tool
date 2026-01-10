# Tex-Tool Management System

A comprehensive web-based management system for textile businesses, featuring inventory management, sales tracking, vendor/customer management, and more.

## 🚀 Features

- **User Authentication & Authorization**: Secure login and role-based access.
- **Dashboard**: Real-time overview of business metrics.
- **Inventory Management**: Track stock levels, categories, colors, and products.
- **Sales & Purchases**: Manage transactions with vendors and customers.
- **Vendor & Customer Management**: Maintain detailed records of business partners.
- **Reporting**: Generate insights on sales, returns, and inventory.
- **Settings**: Configurable application preferences.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React (with Vite)
- **Styling**: Tailwind CSS, Vanilla CSS
- **Language**: TypeScript
- **State Management**: React Context
- **Routing**: React Router
- **Testing**: Vitest + React Testing Library

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Language**: TypeScript
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Zod
- **Testing**: Vitest + Supertest

## 📋 Prerequisites

- **Node.js**: v18 or higher recommended
- **npm**: v9 or higher
- **MongoDB**: A running MongoDB instance (local or Atlas)

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Tex-tool
```

### 2. Frontend Setup
Navigate to the root directory (frontend is at the root) and install dependencies:
```bash
npm install
```

### 3. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

## ⚙️ Environment Configuration

### Backend
Create a `.env` file in the `backend/` directory with the following variables:

```env
PORT=3000
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
```

> **Note**: For `DATABASE_URL`, ensure you use the correct connection string for your MongoDB instance. For security reasons, do not commit your actual `.env` file to version control.

## 🏃‍♂️ Running the Application

### Development Mode

1.  **Start the Backend Server**:
    ```bash
    cd backend
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

2.  **Start the Frontend Application**:
    Open a new terminal, navigate to the project root, and run:
    ```bash
    npm run dev
    ```
    The application will be accessible at the URL provided by Vite (usually `http://localhost:5173`).

### Database Seeding
To populate the database with initial data (e.g., default admin user), run the seed script from the backend directory:

```bash
cd backend
npm run seed
```

> **Seed Credentials**: The seed script creates a default admin user. Please check `backend/src/seed.ts` or consult your administrator for the default login credentials.

## 🧪 Testing

### Frontend Tests
From the root directory:
```bash
npm test              # Run tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

### Backend Tests
From the backend directory:
```bash
cd backend
npm test              # Run tests
npm run test:ui       # Run tests with UI
npm run test:coverage # Generate coverage report
```

## 📁 Project Structure

### Frontend (`src/`)
-   `components/`: Reusable UI components
-   `pages/`: Application pages (Auth, Dashboard, Inventory, etc.)
-   `context/`: Global state management
-   `hooks/`: Custom React hooks
-   `services/`: API integration services
-   `utils/`: Helper functions and validation
-   `constants/`: App-wide constants

### Backend (`backend/src/`)
-   `config/`: Database and app configuration
-   `controllers/`: Request handling logic
-   `routes/`: API route definitions
-   `middleware/`: Express middleware (auth, error handling)
-   `models/`: Database schemas (if using Mongoose/TypeORM schemas)
-   `utils/`: Helper functions
