# EMS-Formonex - Employee Training Management System

A comprehensive, real-time Employee Training Management System built with React, Firebase, and Tailwind CSS.

## 🚀 Features

### Core Functionality
- **Real-time Authentication** - Firebase Auth with role-based access (Admin/Employee)
- **Attendance Management** - Real-time check-in/out with online/offline detection
- **Task Management** - CRUD operations with priority, status, and assignment tracking
- **Team Chat** - Real-time messaging with multiple channels
- **Learning Library** - Resource management and progress tracking
- **Admin Dashboard** - Employee management, batch operations, and analytics

### Technical Features
- **Real-time Updates** - Firebase Firestore real-time synchronization
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Dark/Light Mode** - Theme switching with context management
- **Excel Export** - Export data to Excel files for reporting
- **Push Notifications** - In-app and browser notifications
- **Activity Logging** - User activity tracking and monitoring

## 🛠️ Tech Stack

- **Frontend**: React 18 (JavaScript), Vite
- **Styling**: Tailwind CSS, Heroicons
- **Backend**: Firebase (Auth, Firestore, Storage, Realtime Database)
- **Charts**: Chart.js, Recharts
- **Excel Export**: SheetJS (xlsx)
- **Date Handling**: date-fns
- **Notifications**: React Hot Toast

## 🔧 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EMS-Formonex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, Storage, and Realtime Database
   - Copy your Firebase config and update `src/firebase/config.js`

4. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Run the application**
   ```bash
   npm run dev
   ```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── Layout.jsx
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # React contexts
│   ├── AuthContext.jsx
│   └── ThemeContext.jsx
├── firebase/           # Firebase services
│   ├── config.js
│   ├── auth.js
│   ├── firestore.js
│   ├── storage.js
│   └── realtime.js
├── pages/              # Main application pages
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Attendance.jsx
│   ├── Tasks.jsx
│   ├── Chat.jsx
│   ├── Learning.jsx
│   ├── Profile.jsx
│   └── admin/
│       ├── Employees.jsx
│       ├── Batches.jsx
│       └── Reports.jsx
├── services/           # Utility services
│   ├── excelService.js
│   └── notificationService.js
└── styles/             # Styling
    └── index.css
```

## 🔐 Authentication & Roles

### User Roles
- **Admin**: Full access to all features, employee management, batch operations
- **Employee**: Access to personal attendance, tasks, chat, and learning resources

### Authentication Flow
1. User registers/logs in via Firebase Auth
2. Role is assigned during registration or by admin
3. Protected routes ensure role-based access control

## 📊 Database Schema

### Firestore Collections

#### Users
```javascript
{
  id: string,
  email: string,
  displayName: string,
  role: 'admin' | 'employee',
  department: string,
  position: string,
  batch: string,
  joinDate: timestamp,
  status: 'active' | 'inactive'
}
```

#### Attendance
```javascript
{
  userId: string,
  userName: string,
  checkInTime: timestamp,
  checkOutTime: timestamp,
  hoursWorked: number,
  status: 'checked-in' | 'checked-out',
  location: string,
  createdAt: timestamp
}
```

#### Tasks
```javascript
{
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high',
  status: 'pending' | 'in-progress' | 'completed',
  assignedTo: string,
  createdBy: string,
  dueDate: timestamp,
  createdAt: timestamp
}
```

#### Messages
```javascript
{
  text: string,
  sender: string,
  senderId: string,
  channel: string,
  createdAt: timestamp,
  type: 'text' | 'file'
}
```

## 🎨 UI/UX Features

### Design System
- **Color Scheme**: Professional blue and gray palette
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent spacing scale
- **Components**: Reusable, accessible components

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Optimized for all device sizes

### Dark Mode
- System preference detection
- Manual toggle option
- Persistent theme preference

## 📈 Key Features Walkthrough

### 1. Attendance Management
- Real-time check-in/check-out
- Online/offline status detection
- Admin view of all employee attendance
- Excel export for reporting
- Automatic offline marking on tab close

### 2. Task Management
- Create, edit, delete tasks
- Priority levels and status tracking
- Admin task assignment to employees
- Due date management
- Excel export functionality

### 3. Team Chat
- Real-time messaging
- Multiple channels (General, Development, Design, etc.)
- Online users display
- Message grouping and timestamps
- Responsive chat interface

### 4. Learning Library
- Resource upload and management
- Categorization and tagging
- Progress tracking
- Download functionality
- Admin content management

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style
- JavaScript (ES6+)
- React Hooks
- Functional components
- Tailwind CSS classes
- Firebase v9 modular SDK

## 📱 Mobile Optimization

- Touch-friendly interface
- Optimized layouts for small screens
- Gesture support
- Fast loading times
- Offline capability planning

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

## 🔒 Security

- Firebase Security Rules for Firestore
- Authentication required for all operations
- Role-based access control
- Input validation and sanitization
- HTTPS enforcement

## 📧 Support

For support and questions, please contact the development team or create an issue in the repository.

## 📄 License

This project is proprietary software developed for Formonex.

---

**Built with ❤️ by the Formonex Development Team**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
