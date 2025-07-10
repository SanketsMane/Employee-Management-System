// Database service for Firebase Firestore operations
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';

class DatabaseService {
  // Collections
  static COLLECTIONS = {
    USERS: 'users',
    EMPLOYEES: 'employees',
    BATCHES: 'batches',
    COURSES: 'courses',
    ATTENDANCE: 'attendance',
    TASKS: 'tasks',
    REPORTS: 'reports',
    ACTIVITY_LOGS: 'activity_logs',
    NOTIFICATIONS: 'notifications',
    SETTINGS: 'settings'
  };

  // Generic CRUD operations
  static async create(collectionName, data) {
    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error);
      throw error;
    }
  }

  static async read(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error reading document from ${collectionName}:`, error);
      throw error;
    }
  }

  static async update(collectionName, docId, data) {
    try {
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error);
      throw error;
    }
  }

  static async delete(collectionName, docId) {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }

  static async list(collectionName, queryOptions = {}) {
    try {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;

      // Apply query options
      if (queryOptions.where) {
        for (const condition of queryOptions.where) {
          q = query(q, where(condition.field, condition.operator, condition.value));
        }
      }

      if (queryOptions.orderBy) {
        q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
      }

      if (queryOptions.limit) {
        q = query(q, limit(queryOptions.limit));
      }

      if (queryOptions.startAfter) {
        q = query(q, startAfter(queryOptions.startAfter));
      }

      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      return documents;
    } catch (error) {
      console.error(`Error listing documents from ${collectionName}:`, error);
      throw error;
    }
  }

  // Real-time listeners
  static onSnapshot(collectionName, callback, queryOptions = {}) {
    try {
      const collectionRef = collection(db, collectionName);
      let q = collectionRef;

      // Apply query options
      if (queryOptions.where) {
        for (const condition of queryOptions.where) {
          q = query(q, where(condition.field, condition.operator, condition.value));
        }
      }

      if (queryOptions.orderBy) {
        q = query(q, orderBy(queryOptions.orderBy.field, queryOptions.orderBy.direction || 'asc'));
      }

      if (queryOptions.limit) {
        q = query(q, limit(queryOptions.limit));
      }

      return onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({ id: doc.id, ...doc.data() });
        });
        callback(documents);
      });
    } catch (error) {
      console.error(`Error setting up listener for ${collectionName}:`, error);
      throw error;
    }
  }

  // Batch operations
  static async batchWrite(operations) {
    try {
      const batch = writeBatch(db);

      operations.forEach(operation => {
        const docRef = doc(db, operation.collection, operation.id);
        
        switch (operation.type) {
          case 'create':
            batch.set(docRef, {
              ...operation.data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...operation.data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
        }
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error in batch write:', error);
      throw error;
    }
  }

  // User-specific operations
  static async getUserProfile(userId) {
    return await this.read(this.COLLECTIONS.USERS, userId);
  }

  static async createUserProfile(userId, profileData) {
    const docRef = doc(db, this.COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      ...profileData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return userId;
  }

  static async updateUserProfile(userId, profileData) {
    return await this.update(this.COLLECTIONS.USERS, userId, profileData);
  }

  // Employee operations
  static async getAllEmployees() {
    return await this.list(this.COLLECTIONS.EMPLOYEES, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  static async getActiveEmployees() {
    return await this.list(this.COLLECTIONS.EMPLOYEES, {
      where: [{ field: 'status', operator: '==', value: 'active' }]
    });
  }

  static async createEmployee(employeeData) {
    return await this.create(this.COLLECTIONS.EMPLOYEES, employeeData);
  }

  static async updateEmployee(employeeId, employeeData) {
    return await this.update(this.COLLECTIONS.EMPLOYEES, employeeId, employeeData);
  }

  static async deleteEmployee(employeeId) {
    return await this.delete(this.COLLECTIONS.EMPLOYEES, employeeId);
  }

  // Batch operations
  static async getAllBatches() {
    return await this.list(this.COLLECTIONS.BATCHES, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  static async getActiveBatches() {
    return await this.list(this.COLLECTIONS.BATCHES, {
      where: [{ field: 'status', operator: '==', value: 'active' }]
    });
  }

  static async createBatch(batchData) {
    return await this.create(this.COLLECTIONS.BATCHES, batchData);
  }

  static async updateBatch(batchId, batchData) {
    return await this.update(this.COLLECTIONS.BATCHES, batchId, batchData);
  }

  static async deleteBatch(batchId) {
    return await this.delete(this.COLLECTIONS.BATCHES, batchId);
  }

  // Course operations
  static async getAllCourses() {
    return await this.list(this.COLLECTIONS.COURSES, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  static async getActiveCourses() {
    return await this.list(this.COLLECTIONS.COURSES, {
      where: [{ field: 'status', operator: '==', value: 'active' }]
    });
  }

  static async createCourse(courseData) {
    return await this.create(this.COLLECTIONS.COURSES, courseData);
  }

  static async updateCourse(courseId, courseData) {
    return await this.update(this.COLLECTIONS.COURSES, courseId, courseData);
  }

  static async deleteCourse(courseId) {
    return await this.delete(this.COLLECTIONS.COURSES, courseId);
  }

  // Attendance operations
  static async getAttendanceByEmployee(employeeId) {
    return await this.list(this.COLLECTIONS.ATTENDANCE, {
      where: [{ field: 'employeeId', operator: '==', value: employeeId }],
      orderBy: { field: 'date', direction: 'desc' }
    });
  }

  static async getAttendanceByDate(date) {
    return await this.list(this.COLLECTIONS.ATTENDANCE, {
      where: [{ field: 'date', operator: '==', value: date }]
    });
  }

  static async markAttendance(attendanceData) {
    return await this.create(this.COLLECTIONS.ATTENDANCE, attendanceData);
  }

  static async updateAttendance(attendanceId, attendanceData) {
    return await this.update(this.COLLECTIONS.ATTENDANCE, attendanceId, attendanceData);
  }

  // Task operations
  static async getTasksByEmployee(employeeId) {
    return await this.list(this.COLLECTIONS.TASKS, {
      where: [{ field: 'assignedTo', operator: '==', value: employeeId }],
      orderBy: { field: 'dueDate', direction: 'asc' }
    });
  }

  static async getAllTasks() {
    return await this.list(this.COLLECTIONS.TASKS, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  static async createTask(taskData) {
    return await this.create(this.COLLECTIONS.TASKS, taskData);
  }

  static async updateTask(taskId, taskData) {
    return await this.update(this.COLLECTIONS.TASKS, taskId, taskData);
  }

  static async deleteTask(taskId) {
    return await this.delete(this.COLLECTIONS.TASKS, taskId);
  }

  // Report operations
  static async getAllReports() {
    return await this.list(this.COLLECTIONS.REPORTS, {
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  static async getReportsByType(type) {
    return await this.list(this.COLLECTIONS.REPORTS, {
      where: [{ field: 'type', operator: '==', value: type }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  static async createReport(reportData) {
    return await this.create(this.COLLECTIONS.REPORTS, reportData);
  }

  static async updateReport(reportId, reportData) {
    return await this.update(this.COLLECTIONS.REPORTS, reportId, reportData);
  }

  static async deleteReport(reportId) {
    return await this.delete(this.COLLECTIONS.REPORTS, reportId);
  }

  // Activity log operations
  static async getActivityLogs(limit = 50) {
    return await this.list(this.COLLECTIONS.ACTIVITY_LOGS, {
      orderBy: { field: 'timestamp', direction: 'desc' },
      limit: limit
    });
  }

  static async logActivity(activityData) {
    return await this.create(this.COLLECTIONS.ACTIVITY_LOGS, {
      ...activityData,
      timestamp: serverTimestamp()
    });
  }

  // Notification operations
  static async getUserNotifications(userId) {
    return await this.list(this.COLLECTIONS.NOTIFICATIONS, {
      where: [{ field: 'userId', operator: '==', value: userId }],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  static async createNotification(notificationData) {
    return await this.create(this.COLLECTIONS.NOTIFICATIONS, notificationData);
  }

  static async markNotificationAsRead(notificationId) {
    return await this.update(this.COLLECTIONS.NOTIFICATIONS, notificationId, {
      read: true,
      readAt: serverTimestamp()
    });
  }

  static async deleteNotification(notificationId) {
    return await this.delete(this.COLLECTIONS.NOTIFICATIONS, notificationId);
  }

  // Dashboard statistics
  static async getDashboardStats() {
    try {
      const [employees, batches, courses, tasks, reports] = await Promise.all([
        this.getAllEmployees(),
        this.getAllBatches(),
        this.getAllCourses(),
        this.getAllTasks(),
        this.getAllReports()
      ]);

      const activeEmployees = employees.filter(emp => emp.status === 'active');
      const activeBatches = batches.filter(batch => batch.status === 'active');
      const activeCourses = courses.filter(course => course.status === 'active');
      const completedTasks = tasks.filter(task => task.status === 'completed');
      const pendingTasks = tasks.filter(task => task.status === 'pending');

      return {
        totalEmployees: employees.length,
        activeEmployees: activeEmployees.length,
        totalBatches: batches.length,
        activeBatches: activeBatches.length,
        totalCourses: courses.length,
        activeCourses: activeCourses.length,
        totalTasks: tasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        totalReports: reports.length
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }
}

export default DatabaseService;
