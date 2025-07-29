# Splitwise Clone

A full-stack expense splitting application built with React (frontend) and Spring Boot (backend).

## 🚀 Features

- **User Authentication**: JWT-based login and registration
- **Expense Management**: Create and track expenses in groups
- **Budget Tracking**: Set monthly budgets and track spending
- **Group Management**: Create and manage expense groups
- **Activity Feed**: View recent transactions and updates
- **Responsive Design**: Modern UI that works on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **React Router DOM** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Context API** for state management

### Backend
- **Spring Boot 3** with Java 17
- **Spring Security** with JWT authentication
- **Spring Data JPA** for database operations
- **PostgreSQL** database
- **Maven** for dependency management

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **Java 17** or higher
- **PostgreSQL** database
- **Maven** (included with the project)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd splitwise
```

### 2. Database Setup
1. Create a PostgreSQL database named `splitwise_db`
2. Update database credentials in `backend/src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.username=postgres
   spring.datasource.password=postgres
   ```

### 3. Start the Backend
```bash
cd backend
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8080`

### 4. Start the Frontend
```bash
cd ../
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`

## 📱 Available Routes

### Public Routes
- `/login` - Login and registration page

### Protected Routes (require authentication)
- `/` - Dashboard with budget summary and recent activity
- `/groups` - Manage expense groups
- `/expenses` - View expense activity
- `/budget` - Manage monthly budgets
- `/profile` - User profile settings

## 🔐 Authentication Flow

1. **Registration**: Users can create an account with name, email, and password
2. **Login**: Users authenticate with email and password
3. **JWT Token**: Upon successful login, a JWT token is issued
4. **Protected Routes**: All routes except `/login` require authentication
5. **Token Storage**: JWT token is stored in localStorage
6. **Auto-logout**: Token expiration triggers automatic logout

## 🗄️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/debug/user/{email}` - Debug user lookup

### Users
- `GET /api/users` - Get all users
- `GET /api/users/{id}` - Get user by ID

### Budgets
- `POST /api/budget` - Create or update budget
- `GET /api/budget/{id}` - Get budget by ID
- `GET /api/budget/user/{userId}` - Get user budgets
- `GET /api/budget/summary/{userId}` - Get budget summary
- `GET /api/budget/exceeded/{userId}` - Get exceeded budgets
- `GET /api/budget/nearing-limit/{userId}` - Get budgets nearing limit
- `DELETE /api/budget/{id}` - Delete budget

### Groups
- `POST /createGroup` - Create new group
- `POST /addExpense` - Add expense to group
- `GET /settleUp/{groupId}/{userId}` - Settle up for group
- `GET /expenses` - Get expenses with filters

## 🎯 Key Features Explained

### Dashboard
- **Budget Summary**: Shows total budget, spent amount, and remaining budget
- **Recent Activity**: Displays latest expenses and transactions
- **Search**: Filter activities by description, user, or date

### Groups
- **Create Groups**: Add new expense groups with members
- **View Groups**: See all groups you're a member of
- **Group Details**: View expenses and balances within groups

### Budget Management
- **Create Budgets**: Set monthly spending limits by category
- **Track Spending**: Monitor budget usage and remaining amounts
- **Alerts**: Get notified when approaching or exceeding limits

### Activity Feed
- **Recent Transactions**: View latest expenses and settlements
- **Filtering**: Filter by category, date range, or group
- **Real-time Updates**: See new activities as they happen

## 🔧 Development

### Frontend Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Compile and run
./mvnw spring-boot:run

# Run tests
./mvnw test

# Clean and compile
./mvnw clean compile
```

### Database Management
The application uses Hibernate with `ddl-auto=update`, so the database schema will be automatically created/updated when you start the application.

## 🐛 Troubleshooting

### Common Issues

1. **Backend won't start**
   - Check if PostgreSQL is running
   - Verify database credentials in `application.properties`
   - Ensure Java 17+ is installed

2. **Frontend can't connect to backend**
   - Verify backend is running on port 8080
   - Check CORS configuration in `SecurityConfig.java`
   - Ensure API base URL is correct in `api.js`

3. **Authentication issues**
   - Check browser console for JWT errors
   - Verify token is being sent in Authorization header
   - Check backend logs for authentication errors

4. **Database connection issues**
   - Ensure PostgreSQL is running
   - Check database name, username, and password
   - Verify database exists

### Debug Mode
Enable debug logging by adding to `application.properties`:
```properties
logging.level.practice.project.splitwise=DEBUG
```

## 📝 Environment Variables

### Frontend
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### Backend
Update `application.properties`:
```properties
# Database
spring.datasource.url=jdbc:postgresql://localhost:5432/splitwise_db
spring.datasource.username=your_username
spring.datasource.password=your_password

# JWT
jwt.secret=your_jwt_secret_key
jwt.expiration=36000000

# Server
server.port=8080
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section
2. Review the console logs
3. Check the backend application logs
4. Create an issue with detailed error information
