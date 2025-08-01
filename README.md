# SplitWise Clone - Frontend

A comprehensive expense splitting application built with React and Spring Boot, featuring modern UI design and full CRUD operations for expense management.

## 🚀 Features

### Authentication & User Management
- **User Registration & Login**: Secure JWT-based authentication
- **Profile Management**: Update user information and view statistics
- **User Statistics**: Track total spending, group memberships, and expense history

### Group Management
- **Create Groups**: Add new expense groups with members
- **Group Details**: Comprehensive group view with tabs for:
  - Overview with recent activity and member balances
  - Members management
  - Expense management
  - Settle up functionality
- **Group Statistics**: Track total spending, member count, and currency

### Expense Management
- **Add Expenses**: Create new expenses with detailed information:
  - Description, amount, category
  - Split types (Equal, Percentage, Exact, Shares)
  - Recurring expenses with intervals
  - Notes and timestamps
- **Edit & Delete**: Full CRUD operations for expenses
- **Expense Categories**: Predefined categories with icons
- **Expense Filtering**: Filter by group, category, date range

### Budget Management
- **Create Budgets**: Set monthly spending limits by category
- **Budget Tracking**: Monitor spending against limits
- **Budget Alerts**: Visual indicators for exceeded and nearing limits
- **Budget Statistics**: Summary views and detailed breakdowns

### Settle Up Functionality
- **Calculate Settlements**: Automatic calculation of who owes what
- **Settlement Tracking**: Mark transactions as settled
- **Balance Overview**: Clear view of member balances

### Dashboard & Analytics
- **Comprehensive Dashboard**: Overview of all financial activities
- **Real-time Statistics**: Live updates of spending and balances
- **Activity Feed**: Recent transactions with filtering
- **Budget Alerts**: Notifications for exceeded budgets

## 🛠️ Technology Stack

### Frontend
- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icons
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

### Backend Integration
- **Spring Boot**: RESTful API backend
- **JWT Authentication**: Secure token-based auth
- **MySQL**: Database storage
- **Maven**: Build tool

## 📁 Project Structure

```
splitwise/
├── src/
│   ├── components/
│   │   ├── Activity.jsx          # Enhanced activity feed with filtering
│   │   ├── Dashboard.jsx         # Comprehensive dashboard
│   │   ├── ExpenseManager.jsx    # Full expense CRUD operations
│   │   ├── GroupDetails.jsx      # Detailed group management
│   │   ├── Groups.jsx            # Group listing and creation
│   │   ├── Sidebar.jsx           # Navigation sidebar
│   │   └── BackendStatus.jsx     # Backend connection status
│   ├── pages/
│   │   ├── HomePage.jsx          # Main dashboard page
│   │   ├── LoginPage.jsx         # Authentication
│   │   ├── Budget.jsx            # Budget management
│   │   └── Profile.jsx           # User profile and statistics
│   ├── services/
│   │   ├── api.js                # Base API configuration
│   │   ├── authService.js        # Authentication services
│   │   ├── budgetService.js      # Budget API calls
│   │   ├── expenseService.js     # Expense API calls
│   │   ├── groupService.js       # Group API calls
│   │   └── userService.js        # User API calls
│   ├── contexts/
│   │   └── AuthContext.jsx       # Authentication context
│   └── utils/
│       ├── constants.js          # Application constants
│       └── helpers.js            # Utility functions
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Backend server running on `http://localhost:8080`

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd splitwise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

### Backend URL
The frontend is configured to connect to the backend at `http://localhost:8080`. You can modify this in:
- `src/services/api.js` - Base API configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_BASE_URL=http://localhost:8080
```

## 📱 Features in Detail

### 1. Authentication Flow
- **Login**: Email/password authentication with JWT tokens
- **Registration**: New user signup with validation
- **Token Management**: Automatic token refresh and storage
- **Protected Routes**: Route protection based on authentication status

### 2. Dashboard Overview
- **Welcome Message**: Personalized greeting with user name
- **Budget Alerts**: Visual notifications for budget issues
- **Statistics Cards**: 
  - Total budget and spending
  - Group count and activity
  - Recent transactions
- **Quick Actions**: Easy access to common functions

### 3. Group Management
- **Group Creation**: Create new groups with members
- **Group Details**: Comprehensive view with tabs:
  - **Overview**: Recent activity and member balances
  - **Members**: Member list with balances
  - **Expenses**: Full expense management
  - **Settle Up**: Settlement calculations and tracking

### 4. Expense Management
- **Add Expenses**: Comprehensive expense form with:
  - Basic details (description, amount, date)
  - Category selection with icons
  - Split type configuration
  - Recurring expense options
  - Notes and additional details
- **Edit/Delete**: Full CRUD operations
- **Filtering**: Filter by group, category, date range
- **Search**: Real-time search functionality

### 5. Budget Management
- **Create Budgets**: Set monthly limits by category
- **Visual Indicators**: Progress bars and color coding
- **Alerts**: Notifications for exceeded/nearing limits
- **Statistics**: Detailed budget breakdowns

### 6. Activity Tracking
- **Comprehensive Feed**: All transactions with details
- **Advanced Filtering**: Multiple filter options
- **Search**: Real-time search across all fields
- **Statistics**: Total spending and averages

### 7. User Profile
- **Personal Information**: Edit user details
- **Statistics**: User spending and group statistics
- **Recent Activity**: Personal transaction history
- **Group Memberships**: Overview of user's groups

## 🎨 UI/UX Features

### Design System
- **Modern Design**: Clean, professional interface
- **Responsive Layout**: Works on all device sizes
- **Color Coding**: Intuitive color system for different states
- **Icons**: Consistent iconography throughout
- **Animations**: Smooth transitions and hover effects

### User Experience
- **Intuitive Navigation**: Clear navigation structure
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Empty States**: Helpful messages when no data exists
- **Confirmation Dialogs**: Safe deletion and important actions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Protected Routes**: Route-level security
- **API Security**: Automatic token inclusion in requests
- **Input Validation**: Client-side validation
- **Error Handling**: Secure error handling

## 📊 Data Management

### State Management
- **React Context**: Global state for authentication
- **Local State**: Component-level state management
- **API Integration**: Real-time data synchronization

### Data Flow
1. **API Calls**: Centralized service layer
2. **State Updates**: Reactive UI updates
3. **Error Handling**: Comprehensive error management
4. **Loading States**: User feedback during operations

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy
The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Note**: This frontend application is designed to work with the SplitWise backend API. Ensure the backend server is running and properly configured before using the frontend features.
