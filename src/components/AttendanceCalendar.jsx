import { useState, useEffect } from 'react';
import { apiClient } from '../services/api/client';
import { useAuth } from '../contexts/AuthContext';
import { ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function AttendanceCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (user) {
      fetchAttendanceData();
    }
  }, [currentDate, user]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      // Get user ID from AuthContext
      const employeeId = user?.id || user?.userId || user?._id;
      
      if (!employeeId) {
        console.log('No employee ID found, using empty data');
        setAttendanceData([]);
        return;
      }
      
      // Format month parameter as YYYY-MM as expected by backend
      const monthParam = `${year}-${month.toString().padStart(2, '0')}`;
      
      console.log(`Fetching attendance for employee ${employeeId} for month ${monthParam}`);
      
      // Use the correct endpoint that exists in backend: /attendance/:employeeId/:month
      const response = await apiClient.get(`/attendance/${employeeId}/${monthParam}`);
      if (response.success) {
        console.log('Attendance data received:', response.data);
        // Transform the data to match our expected format
        const transformedData = response.data.map(record => ({
          ...record,
          date: new Date(record.date).toISOString().split('T')[0] // Convert to YYYY-MM-DD format
        }));
        setAttendanceData(transformedData);
      } else {
        console.log('API response not successful:', response);
        setAttendanceData([]);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      // Don't show error toast for now, just log it
      console.log('Attendance API not available, using mock data');
      setAttendanceData([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getAttendanceForDate = (day) => {
    if (!day) return null;
    
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendanceData.find(record => record.date === dateStr);
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) return 'no-data';
    
    switch (attendance.status) {
      case 'present':
        return 'present';
      case 'absent':
        return 'absent';
      case 'late':
        return 'late';
      case 'half-day':
        return 'half-day';
      default:
        return 'no-data';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'half-day':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-500 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'absent':
        return <XCircleIcon className="w-4 h-4" />;
      case 'late':
        return <ClockIcon className="w-4 h-4" />;
      case 'half-day':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const calculateWorkingHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return 'N/A';
    
    try {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffMs = end - start;
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      return `${diffHours}h ${diffMinutes}m`;
    } catch (error) {
      return 'N/A';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const attendanceStats = {
    present: attendanceData.filter(record => record.status === 'present').length,
    absent: attendanceData.filter(record => record.status === 'absent').length,
    late: attendanceData.filter(record => record.status === 'late').length,
    halfDay: attendanceData.filter(record => record.status === 'half-day').length,
    total: attendanceData.length
  };

  const attendancePercentage = attendanceStats.total > 0 
    ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <span className="ml-3 text-gray-600">Loading calendar...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h3>
          <p className="text-gray-600 mt-1">
            {attendanceStats.total > 0 ? (
              <>
                {attendanceStats.present} present out of {attendanceStats.total} working days
                <span className="ml-2 text-green-600 font-medium">({attendancePercentage}%)</span>
              </>
            ) : (
              'No attendance data available'
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 text-sm font-medium text-violet-600 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRightIcon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Attendance Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="flex items-center">
            <CheckCircleIcon className="w-5 h-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm text-green-600 font-medium">Present</p>
              <p className="text-xl font-bold text-green-700">{attendanceStats.present}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center">
            <XCircleIcon className="w-5 h-5 text-red-600 mr-2" />
            <div>
              <p className="text-sm text-red-600 font-medium">Absent</p>
              <p className="text-xl font-bold text-red-700">{attendanceStats.absent}</p>
            </div>
          </div>
        </div>
        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 text-amber-600 mr-2" />
            <div>
              <p className="text-sm text-amber-600 font-medium">Late</p>
              <p className="text-xl font-bold text-amber-700">{attendanceStats.late}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
          <div className="flex items-center">
            <ClockIcon className="w-5 h-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Half Day</p>
              <p className="text-xl font-bold text-orange-700">{attendanceStats.halfDay}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const attendance = getAttendanceForDate(day);
            const status = getAttendanceStatus(attendance);
            const isToday = day && 
              currentDate.getFullYear() === new Date().getFullYear() &&
              currentDate.getMonth() === new Date().getMonth() &&
              day === new Date().getDate();

            return (
              <div
                key={index}
                className={`p-3 border-b border-r border-gray-100 min-h-[80px] cursor-pointer hover:bg-gray-50 transition-colors ${
                  isToday ? 'bg-violet-50' : ''
                }`}
                onClick={() => day && setSelectedDate(attendance)}
              >
                {day && (
                  <div className="space-y-2">
                    <div className={`text-sm font-medium ${isToday ? 'text-violet-600' : 'text-gray-900'}`}>
                      {day}
                    </div>
                    {attendance && (
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {getStatusIcon(status)}
                        <span className="ml-1 capitalize">
                          {status === 'half-day' ? 'Half' : status === 'no-data' ? 'N/A' : status}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details Modal */}
      {selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                Attendance Details
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <p className="text-gray-900">{new Date(selectedDate.date).toLocaleDateString()}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border mt-1 ${getStatusColor(selectedDate.status)}`}>
                  {getStatusIcon(selectedDate.status)}
                  <span className="ml-2 capitalize">{selectedDate.status}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Check In</label>
                  <p className="text-gray-900">{formatTime(selectedDate.checkIn)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Check Out</label>
                  <p className="text-gray-900">{formatTime(selectedDate.checkOut)}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Working Hours</label>
                <p className="text-gray-900">{calculateWorkingHours(selectedDate.checkIn, selectedDate.checkOut)}</p>
              </div>
              
              {selectedDate.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-gray-900">{selectedDate.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
