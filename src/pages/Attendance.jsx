import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  addDoc, 
  updateDoc, 
  doc, 
  onSnapshot,
  getDocs 
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { setUserOnline, setUserOffline, logActivity } from '../firebase/realtime';
import { exportAttendanceToExcel } from '../services/excelService';
import { showNotification } from '../services/notificationService';
import {
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  WifiIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { format, isToday, startOfDay, endOfDay } from 'date-fns';

export default function Attendance() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState(null);
  const [totalHours, setTotalHours] = useState(0);
  const [allEmployeeAttendance, setAllEmployeeAttendance] = useState([]);

  // Check online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setUserOnline(user.uid);
      showNotification('You are back online!', 'success');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setUserOffline(user.uid);
      showNotification('You are offline. Attendance will be synced when back online.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (navigator.onLine) {
      setUserOnline(user.uid);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user.uid]);

  // Auto mark offline on tab close/page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      setUserOffline(user.uid);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [user.uid]);

  // Load attendance records
  useEffect(() => {
    if (!user) return;

    const attendanceRef = collection(db, 'attendance');
    let q;

    if (user.role === 'admin') {
      q = query(attendanceRef, orderBy('createdAt', 'desc'), limit(100));
    } else {
      q = query(
        attendanceRef,
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        checkInTime: doc.data().checkInTime?.toDate(),
        checkOutTime: doc.data().checkOutTime?.toDate()
      }));

      setAttendanceRecords(records);

      const today = records.find(record => 
        record.userId === user.uid && 
        record.createdAt && 
        isToday(record.createdAt)
      );

      if (today) {
        setTodayAttendance(today);
        setCheckedInToday(true);
        setLastCheckInTime(today.checkInTime);
      }

      setIsLoading(false);
    });

    return unsubscribe;
  }, [user]);

  // Load all employee attendance for admin
  useEffect(() => {
    if (user?.role !== 'admin') return;

    const loadAllEmployeeAttendance = async () => {
      try {
        const today = new Date();
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        const attendanceRef = collection(db, 'attendance');
        const q = query(
          attendanceRef,
          where('createdAt', '>=', startOfToday),
          where('createdAt', '<=', endOfToday)
        );

        const snapshot = await getDocs(q);
        const todayRecords = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          checkInTime: doc.data().checkInTime?.toDate(),
          checkOutTime: doc.data().checkOutTime?.toDate()
        }));

        setAllEmployeeAttendance(todayRecords);
      } catch (error) {
        console.error('Error loading employee attendance:', error);
      }
    };

    loadAllEmployeeAttendance();
  }, [user?.role]);

  const handleCheckIn = async () => {
    if (!user || checkedInToday) return;

    try {
      const now = new Date();
      const attendanceData = {
        userId: user.uid,
        userName: user.displayName || user.email,
        userEmail: user.email,
        checkInTime: now,
        status: 'checked-in',
        location: 'Office',
        createdAt: now,
        updatedAt: now
      };

      await addDoc(collection(db, 'attendance'), attendanceData);
      await setUserOnline(user.uid);
      await logActivity(user.uid, 'check-in', 'Checked in for work');

      setCheckedInToday(true);
      setLastCheckInTime(now);
      showNotification('Successfully checked in!', 'success');
    } catch (error) {
      console.error('Error checking in:', error);
      showNotification('Error checking in. Please try again.', 'error');
    }
  };

  const handleCheckOut = async () => {
    if (!user || !checkedInToday || !todayAttendance) return;

    try {
      const now = new Date();
      const checkInTime = todayAttendance.checkInTime;
      const hoursWorked = (now - checkInTime) / (1000 * 60 * 60);

      await updateDoc(doc(db, 'attendance', todayAttendance.id), {
        checkOutTime: now,
        status: 'checked-out',
        hoursWorked: Math.round(hoursWorked * 100) / 100,
        updatedAt: now
      });

      await setUserOffline(user.uid);
      await logActivity(user.uid, 'check-out', `Checked out after ${Math.round(hoursWorked * 100) / 100} hours`);

      setCheckedInToday(false);
      setTotalHours(hoursWorked);
      showNotification(`Successfully checked out! You worked ${Math.round(hoursWorked * 100) / 100} hours today.`, 'success');
    } catch (error) {
      console.error('Error checking out:', error);
      showNotification('Error checking out. Please try again.', 'error');
    }
  };

  const handleExportAttendance = async () => {
    try {
      const dataToExport = user.role === 'admin' ? attendanceRecords : attendanceRecords.filter(r => r.userId === user.uid);
      await exportAttendanceToExcel(dataToExport);
      showNotification('Attendance exported successfully!', 'success');
    } catch (error) {
      console.error('Error exporting attendance:', error);
      showNotification('Error exporting attendance.', 'error');
    }
  };

  const calculateTotalHours = () => {
    return attendanceRecords
      .filter(record => record.userId === user.uid && record.hoursWorked)
      .reduce((total, record) => total + record.hoursWorked, 0);
  };

  const formatTime = (date) => {
    return date ? format(date, 'HH:mm') : '--:--';
  };

  const formatDate = (date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
      case 'checked-out':
        return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'absent':
        return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      case 'late':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'checked-in':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Attendance Management
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Track your daily attendance and working hours
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {/* Online Status */}
            <div className="flex items-center space-x-2">
              {isOnline ? (
                <WifiIcon className="h-5 w-5 text-green-500" />
              ) : (
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              )}
              <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            
            {/* Export Button */}
            <button
              onClick={handleExportAttendance}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Today's Attendance */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Today's Attendance
        </h2>
        
        {todayAttendance ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatTime(todayAttendance.checkInTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Check In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatTime(todayAttendance.checkOutTime)}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Check Out</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {todayAttendance.hoursWorked ? `${todayAttendance.hoursWorked}h` : '--'}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Hours</div>
            </div>
            <div className="text-center">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(todayAttendance.status)}`}>
                {todayAttendance.status}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No attendance record for today</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex gap-4 justify-center">
          {!checkedInToday ? (
            <button
              onClick={handleCheckIn}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              Check In
            </button>
          ) : !todayAttendance?.checkOutTime ? (
            <button
              onClick={handleCheckOut}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              <XCircleIcon className="h-4 w-4 mr-2" />
              Check Out
            </button>
          ) : (
            <div className="text-green-600 dark:text-green-400 font-medium">
              Attendance complete for today
            </div>
          )}
        </div>
      </div>

      {/* Admin View - All Employee Attendance */}
      {user?.role === 'admin' && (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
              All Employee Attendance Today
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {allEmployeeAttendance.map((record) => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {record.userName?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {record.userName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {record.userEmail}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTime(record.checkInTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatTime(record.checkOutTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {record.hoursWorked ? `${record.hoursWorked}h` : '--'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {allEmployeeAttendance.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                        No attendance records found for today
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Attendance History */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white mb-4">
            Attendance History
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Check In
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Check Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {attendanceRecords.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTime(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatTime(record.checkOutTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.hoursWorked ? `${record.hoursWorked}h` : '--'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
