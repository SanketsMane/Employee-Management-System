// Authentication service for Firebase Auth
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged, 
  updateProfile,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from 'firebase/auth';
import { auth } from '../firebase/config';
import DatabaseService from './databaseService';

class AuthService {
  // Sign in with email and password
  static async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get user profile from database
      const userProfile = await DatabaseService.getUserProfile(user.uid);
      
      // Update last login
      await DatabaseService.updateUserProfile(user.uid, {
        lastLogin: new Date(),
        isOnline: true
      });
      
      // Log activity
      await DatabaseService.logActivity({
        userId: user.uid,
        action: 'login',
        details: `User ${user.email} logged in`,
        ip: await this.getClientIP()
      });
      
      return { user, userProfile };
    } catch (error) {
      console.error('Sign in error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign up with email and password
  static async signUp(email, password, profileData) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update user profile
      await updateProfile(user, {
        displayName: profileData.displayName
      });
      
      // Create user profile in database
      await DatabaseService.createUserProfile(user.uid, {
        ...profileData,
        email: user.email,
        uid: user.uid,
        emailVerified: user.emailVerified,
        isOnline: true,
        status: 'active'
      });
      
      // Log activity
      await DatabaseService.logActivity({
        userId: user.uid,
        action: 'register',
        details: `New user ${user.email} registered`,
        ip: await this.getClientIP()
      });
      
      return { user };
    } catch (error) {
      console.error('Sign up error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Sign out
  static async signOut(userId = null) {
    try {
      if (userId) {
        // Update online status
        await DatabaseService.updateUserProfile(userId, {
          isOnline: false,
          lastSeen: new Date()
        });
        
        // Log activity
        await DatabaseService.logActivity({
          userId: userId,
          action: 'logout',
          details: `User logged out`,
          ip: await this.getClientIP()
        });
      }
      
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Reset password
  static async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Update password
  static async updatePassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }
      
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      // Log activity
      await DatabaseService.logActivity({
        userId: user.uid,
        action: 'password_change',
        details: `Password changed for ${user.email}`,
        ip: await this.getClientIP()
      });
      
      return true;
    } catch (error) {
      console.error('Password update error:', error);
      throw this.handleAuthError(error);
    }
  }

  // Auth state listener
  static onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await DatabaseService.getUserProfile(user.uid);
          callback({ user, userProfile });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          callback({ user, userProfile: null });
        }
      } else {
        callback({ user: null, userProfile: null });
      }
    });
  }

  // Get current user
  static getCurrentUser() {
    return auth.currentUser;
  }

  // Check if user is authenticated
  static isAuthenticated() {
    return !!auth.currentUser;
  }

  // Get client IP (for activity logging)
  static async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return 'unknown';
    }
  }

  // Handle auth errors
  static handleAuthError(error) {
    const errorMessages = {
      'auth/user-not-found': 'No user found with this email address.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password should be at least 6 characters.',
      'auth/invalid-email': 'Invalid email address.',
      'auth/user-disabled': 'This account has been disabled.',
      'auth/too-many-requests': 'Too many failed login attempts. Please try again later.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/requires-recent-login': 'Please log in again to perform this action.',
      'auth/invalid-credential': 'Invalid email or password.'
    };

    const message = errorMessages[error.code] || error.message || 'An error occurred during authentication.';
    
    return {
      code: error.code,
      message: message,
      originalError: error
    };
  }

  // Create demo users for testing
  static async createDemoUsers() {
    try {
      const demoUsers = [
        {
          email: 'admin@formonex.com',
          password: 'admin123',
          profileData: {
            displayName: 'Admin User',
            role: 'admin',
            department: 'Administration',
            position: 'System Administrator',
            phone: '+1234567890',
            status: 'active',
            permissions: ['all'],
            bio: 'System administrator with full access',
            skills: ['Administration', 'Management', 'System Design'],
            joinDate: new Date('2023-01-01')
          }
        },
        {
          email: 'employee@formonex.com',
          password: 'emp123',
          profileData: {
            displayName: 'John Doe',
            role: 'employee',
            department: 'Development',
            position: 'Software Developer',
            phone: '+1234567891',
            status: 'active',
            permissions: ['read', 'write'],
            bio: 'Software developer specializing in web applications',
            skills: ['JavaScript', 'React', 'Node.js', 'MongoDB'],
            joinDate: new Date('2023-06-15')
          }
        }
      ];

      const results = [];
      for (const userData of demoUsers) {
        try {
          const result = await this.signUp(userData.email, userData.password, userData.profileData);
          results.push(result);
        } catch (error) {
          // User might already exist
          if (error.code === 'auth/email-already-in-use') {
            console.log(`Demo user ${userData.email} already exists`);
          } else {
            console.error(`Error creating demo user ${userData.email}:`, error);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error creating demo users:', error);
      throw error;
    }
  }

  // Initialize demo data
  static async initializeDemoData() {
    try {
      // Create demo users
      await this.createDemoUsers();
      
      // Create sample employees
      const sampleEmployees = [
        {
          name: 'Alice Johnson',
          email: 'alice@formonex.com',
          department: 'Marketing',
          position: 'Marketing Manager',
          phone: '+1234567892',
          status: 'active',
          joinDate: new Date('2023-03-10'),
          salary: 65000,
          skills: ['Marketing', 'Content Creation', 'Social Media'],
          manager: 'Admin User'
        },
        {
          name: 'Bob Smith',
          email: 'bob@formonex.com',
          department: 'Development',
          position: 'Senior Developer',
          phone: '+1234567893',
          status: 'active',
          joinDate: new Date('2023-02-20'),
          salary: 75000,
          skills: ['JavaScript', 'Python', 'Database Design'],
          manager: 'Admin User'
        },
        {
          name: 'Carol Davis',
          email: 'carol@formonex.com',
          department: 'HR',
          position: 'HR Specialist',
          phone: '+1234567894',
          status: 'active',
          joinDate: new Date('2023-04-05'),
          salary: 55000,
          skills: ['Recruitment', 'Employee Relations', 'Training'],
          manager: 'Admin User'
        }
      ];

      // Create sample batches
      const sampleBatches = [
        {
          name: 'Web Development Bootcamp',
          description: 'Intensive 12-week web development training program',
          startDate: new Date('2024-01-15'),
          endDate: new Date('2024-04-15'),
          status: 'active',
          instructor: 'Bob Smith',
          capacity: 20,
          enrolled: 15,
          technologies: ['HTML', 'CSS', 'JavaScript', 'React']
        },
        {
          name: 'Digital Marketing Mastery',
          description: 'Comprehensive digital marketing training',
          startDate: new Date('2024-02-01'),
          endDate: new Date('2024-03-30'),
          status: 'active',
          instructor: 'Alice Johnson',
          capacity: 15,
          enrolled: 12,
          technologies: ['SEO', 'Social Media', 'Google Analytics', 'Content Marketing']
        }
      ];

      // Create sample courses
      const sampleCourses = [
        {
          title: 'JavaScript Fundamentals',
          description: 'Learn the basics of JavaScript programming',
          category: 'Programming',
          level: 'Beginner',
          duration: '4 weeks',
          instructor: 'Bob Smith',
          status: 'active',
          modules: 8,
          enrollments: 25
        },
        {
          title: 'React Advanced Concepts',
          description: 'Master advanced React.js concepts and patterns',
          category: 'Programming',
          level: 'Advanced',
          duration: '6 weeks',
          instructor: 'Bob Smith',
          status: 'active',
          modules: 12,
          enrollments: 18
        },
        {
          title: 'Digital Marketing Strategy',
          description: 'Develop effective digital marketing strategies',
          category: 'Marketing',
          level: 'Intermediate',
          duration: '5 weeks',
          instructor: 'Alice Johnson',
          status: 'active',
          modules: 10,
          enrollments: 22
        }
      ];

      // Insert sample data
      const employeePromises = sampleEmployees.map(emp => DatabaseService.createEmployee(emp));
      const batchPromises = sampleBatches.map(batch => DatabaseService.createBatch(batch));
      const coursePromises = sampleCourses.map(course => DatabaseService.createCourse(course));

      await Promise.all([...employeePromises, ...batchPromises, ...coursePromises]);

      console.log('Demo data initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing demo data:', error);
      throw error;
    }
  }
}

export default AuthService;
