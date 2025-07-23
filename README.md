# EMS-Formonex 🏢

> A modern, comprehensive Employee Management System built with React and Firebase, featuring real-time collaboration, attendance tracking, task management, and AI-powered interactions.

![Version](https://img.shields.io/badge/version-0.0.0-blue.svg)
![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-integrated-FFA611?logo=firebase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.17-38B2AC?logo=tailwind-css)

## ✨ Features

### 🎯 Core Management Features
- **Employee Management** - Complete CRUD operations for employee data
- **Attendance Tracking** - Real-time clock-in/out with calendar visualization
- **Task Management** - Individual and batch task assignments with progress tracking
- **Learning Library** - Resource management with upload/download capabilities
- **Batch Management** - Group employees and manage collective assignments
- **Reports & Analytics** - Comprehensive reporting with data visualization

### 🚀 Advanced Capabilities
- **Real-time Chat** - Instant messaging with file attachments
- **Dark/Light Mode** - Seamless theme switching with system preference detection
- **Activity Monitoring** - Real-time user presence and activity tracking
- **Role-based Access** - Admin and employee role management with permissions
- **Responsive Design** - Mobile-first design with modern glassmorphism UI
- **Export Functionality** - Excel export for reports and employee data

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Modern glass-effect UI with backdrop blur
- **Framer Motion Animations** - Smooth transitions and micro-interactions
- **Interactive Elements** - Animated components with hover and tap effects
- **AI Character Integration** - Interactive AI assistant (Formonex AI)
- **Loading States** - Beautiful loading spinners and skeleton screens

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Latest React with concurrent features
- **Vite 7.0.4** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **Framer Motion 12.23.3** - Production-ready motion library
- **React Router Dom 7.6.3** - Declarative routing for React

### Backend & Database
- **Firebase Auth** - Secure authentication with email/password
- **Cloud Firestore** - NoSQL document database for structured data
- **Realtime Database** - Real-time chat and presence tracking
- **Firebase Storage** - File storage for documents and images

### UI & Visualization
- **Heroicons 2.2.0** - Beautiful hand-crafted SVG icons
- **Chart.js 4.5.0** & **Recharts 3.1.0** - Interactive data visualization
- **React Calendar 6.0.0** - Calendar component for attendance
- **Lottie React 2.4.1** - Render After Effects animations

### Development Tools
- **ESLint 9.30.1** - Code linting and formatting
- **PostCSS 8.5.6** - CSS transformation tool
- **React Hot Toast 2.5.2** - Beautiful toast notifications
- **React Hook Form 7.60.0** - Performant forms with easy validation

## � Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Firebase project with enabled services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ems-formonex.git
   cd ems-formonex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, Realtime Database, and Storage
   - Copy your Firebase config to `src/firebase/config.js`

4. **Environment Setup**
   ```bash
   # Update firebase config in src/firebase/config.js
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-auth-domain",
     projectId: "your-project-id",
     // ... other config
   };
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Demo Accounts
For testing purposes, the system includes demo accounts:

**Admin Account:**
- Email: `admin@formonex.com`
- Password: `admin123`

**Employee Account:**
- Email: `employee@formonex.com` 
- Password: `emp123`

## 📱 Application Structure

```
src/
├── components/              # Reusable UI components
│   ├── animations/          # Lottie and motion components
│   ├── Header.jsx          # Navigation header
│   ├── Sidebar.jsx         # Navigation sidebar
│   └── Layout.jsx          # Main layout wrapper
├── contexts/               # React contexts
│   ├── AuthContext.jsx     # Authentication state
│   └── ThemeContext.jsx    # Theme management
├── firebase/               # Firebase services
│   ├── config.js           # Firebase configuration
│   ├── auth.js            # Authentication service
│   ├── firestore.js       # Firestore operations
│   ├── realtime.js        # Realtime database
│   └── storage.js         # File storage
├── pages/                 # Application pages
│   ├── admin/             # Administrator pages
│   ├── Dashboard.jsx      # Employee dashboard
│   ├── Attendance.jsx     # Attendance management
│   ├── Tasks.jsx          # Task management
│   └── Profile.jsx        # User profile
├── services/              # Business logic services
│   ├── authService.js     # Authentication API
│   ├── databaseService.js # Database operations
│   └── excelService.js    # Excel export functionality
└── styles/               # Custom CSS and animations
```

## 🔐 Authentication & Security

### Features
- **Secure Authentication** - Firebase Auth with email/password
- **Role-based Access Control** - Admin and employee permissions
- **Session Management** - Automatic session handling and renewal
- **Password Reset** - Email-based password recovery
- **Activity Logging** - Track user actions and login history

### Security Measures
- **Input Validation** - Form validation with Yup schema
- **Protected Routes** - Route guards based on authentication status
- **Firebase Security Rules** - Database-level security enforcement
- **Error Handling** - Comprehensive error management and user feedback

## 📊 Key Modules

### 👥 Employee Management
- **CRUD Operations** - Create, read, update, delete employee records
- **Bulk Operations** - Import/export employee data via Excel
- **Status Management** - Active, inactive, blocked user states
- **Profile Management** - Detailed employee profiles with photos

### ⏰ Attendance System
- **Real-time Tracking** - Live clock-in/out functionality  
- **Calendar View** - Visual attendance calendar with status indicators
- **Automatic Calculations** - Work hours and overtime calculations
- **Attendance Reports** - Detailed attendance analytics and exports

### 📋 Task Management  
- **Individual Tasks** - Personal task assignments with due dates
- **Batch Tasks** - Group task assignments for teams
- **Progress Tracking** - Real-time task status updates
- **Task Analytics** - Performance metrics and completion rates

### 📚 Learning Library
- **Resource Upload** - Support for various file formats
- **Category Management** - Organized learning materials
- **Access Tracking** - Monitor resource usage and downloads
- **Search & Filter** - Easy resource discovery

### 💬 Real-time Chat
- **Instant Messaging** - Real-time text communication
- **File Sharing** - Document and image attachments
- **Online Status** - User presence indicators
- **Message History** - Persistent chat history

## 🎨 UI/UX Features

### Design System
- **Glassmorphism** - Modern glass-effect design with backdrop blur
- **Gradient Themes** - Beautiful violet/purple/pink color schemes
- **Responsive Layout** - Mobile-first design approach
- **Dark Mode** - System-aware theme switching

### Animations
- **Framer Motion** - Smooth page transitions and micro-interactions
- **Loading States** - Elegant loading animations and skeleton screens
- **Hover Effects** - Interactive button and card animations
- **Layout Animations** - Smooth layout changes and reordering

### Interactive Elements
- **Smart Forms** - Real-time validation with error messaging
- **Data Visualization** - Interactive charts and graphs
- **Modals & Overlays** - Smooth modal transitions
- **Toast Notifications** - Beautiful success/error messages

## 📈 Analytics & Reports

### Dashboard Analytics
- **Employee Metrics** - Total, active, and online employee counts
- **Task Analytics** - Completion rates and pending tasks
- **Attendance Insights** - Monthly attendance percentages
- **Activity Monitoring** - Real-time user activity tracking

### Export Capabilities
- **Excel Reports** - Comprehensive data exports
- **Custom Date Ranges** - Flexible reporting periods
- **Filtered Data** - Export specific subsets of data
- **Formatted Output** - Professional report styling
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
## 🔧 Configuration

### Environment Variables
```bash
# Firebase Configuration (in src/firebase/config.js)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup
1. **Authentication** - Enable Email/Password provider
2. **Firestore** - Create database with security rules
3. **Realtime Database** - Enable for chat functionality
4. **Storage** - Configure for file uploads
5. **Security Rules** - Implement proper access controls

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deployment Options
- **Firebase Hosting** - Seamless integration with Firebase services
- **Vercel** - Zero-configuration deployment
- **Netlify** - Continuous deployment from Git
- **Custom Server** - Deploy built files to any static hosting

### Performance Optimization
- **Code Splitting** - Automatic route-based code splitting
- **Image Optimization** - Optimized image loading and caching
- **Bundle Analysis** - Monitor bundle size and optimize
- **Service Worker** - Cache static assets for faster loading

## 🧪 Development

### Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production  
npm run preview    # Preview production build
npm run lint       # Run ESLint code analysis
```

### Development Features
- **Hot Module Replacement** - Instant updates during development
- **TypeScript Support** - Optional TypeScript integration
- **ESLint Configuration** - Consistent code style enforcement
- **Development Tools** - React DevTools and Firebase Emulator support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style and structure
- Write meaningful commit messages
- Add appropriate documentation for new features
- Test your changes thoroughly before submitting

## � Roadmap

### Upcoming Features
- [ ] **Mobile App** - React Native companion app
- [ ] **Advanced Analytics** - Machine learning insights
- [ ] **Integration APIs** - Third-party service integrations
- [ ] **Workflow Automation** - Automated task assignment and routing
- [ ] **Video Conferencing** - Built-in video chat capabilities
- [ ] **Multi-tenant Support** - Support for multiple organizations

### Performance Improvements
- [ ] **PWA Support** - Progressive Web App capabilities
- [ ] **Offline Mode** - Work offline with data synchronization
- [ ] **Advanced Caching** - Intelligent caching strategies
- [ ] **Load Balancing** - Optimize for high-traffic scenarios

## � Support

### Getting Help
- **Documentation** - Check this README and inline code comments
- **Issues** - Report bugs via GitHub Issues
- **Discussions** - Community discussions and Q&A
- **Email** - Direct support at support@formonex.com

### Troubleshooting
Common issues and solutions:

**Firebase Connection Issues**
- Verify Firebase configuration in `src/firebase/config.js`
- Check Firebase project settings and enabled services
- Ensure proper security rules are configured

**Build Errors**
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for version compatibility issues
- Verify all environment variables are set

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## � Acknowledgments

- **React Team** - For the amazing React framework
- **Firebase** - For comprehensive backend services
- **Tailwind CSS** - For the utility-first CSS framework  
- **Framer Motion** - For beautiful animations
- **Heroicons** - For the beautiful icon set
- **Open Source Community** - For all the amazing libraries and tools

---

<div align="center">

**Built with ❤️ by the Formonex Team**

[Website](https://formonex.com) • [Documentation](https://docs.formonex.com) • [Support](mailto:support@formonex.com)

</div>
- Input validation and sanitization
- HTTPS enforcement

## 📧 Support

For support and questions, please contact the development team or create an issue in the repository.

## 📄 License

This project is proprietary software developed for Formonex.

---

**Built with ❤️ by Sanket**+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
