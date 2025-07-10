import * as XLSX from 'xlsx';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { format } from 'date-fns';

// Export attendance data to Excel
export const exportAttendanceToExcel = async (startDate, endDate, employeeId = null) => {
  try {
    let attendanceQuery = collection(db, 'attendance');
    
    if (employeeId) {
      attendanceQuery = query(
        attendanceQuery,
        where('employeeId', '==', employeeId),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
    } else {
      attendanceQuery = query(
        attendanceQuery,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc')
      );
    }

    const snapshot = await getDocs(attendanceQuery);
    const attendanceData = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      attendanceData.push({
        'Employee ID': data.employeeId,
        'Employee Name': data.employeeName,
        'Date': data.date.toDate().toLocaleDateString(),
        'Check In': data.checkIn ? data.checkIn.toDate().toLocaleTimeString() : 'N/A',
        'Check Out': data.checkOut ? data.checkOut.toDate().toLocaleTimeString() : 'N/A',
        'Total Hours': data.totalHours || 0,
        'Status': data.status,
        'Location': data.location || 'N/A'
      });
    });

    const worksheet = XLSX.utils.json_to_sheet(attendanceData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');

    // Auto-size columns
    const colWidths = [];
    Object.keys(attendanceData[0] || {}).forEach((key) => {
      colWidths.push({ width: Math.max(key.length, 15) });
    });
    worksheet['!cols'] = colWidths;

    const fileName = `attendance_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting attendance:', error);
    return { success: false, error: error.message };
  }
};

// Export tasks data to Excel
export const exportTasksToExcel = async (tasks) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Prepare tasks data
    const tasksData = tasks.map(task => ({
      'Task ID': task.id,
      'Title': task.title,
      'Description': task.description,
      'Priority': task.priority,
      'Status': task.status,
      'Assigned To': task.assignedTo,
      'Due Date': task.dueDate ? format(task.dueDate, 'yyyy-MM-dd') : '',
      'Created Date': task.createdAt ? format(task.createdAt, 'yyyy-MM-dd HH:mm') : '',
      'Updated Date': task.updatedAt ? format(task.updatedAt, 'yyyy-MM-dd HH:mm') : ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(tasksData);
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Task ID
      { wch: 30 }, // Title
      { wch: 50 }, // Description
      { wch: 10 }, // Priority
      { wch: 15 }, // Status
      { wch: 20 }, // Assigned To
      { wch: 15 }, // Due Date
      { wch: 20 }, // Created Date
      { wch: 20 }  // Updated Date
    ];
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');
    
    // Generate filename with current date
    const fileName = `tasks_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Save file
    XLSX.writeFile(workbook, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting tasks to Excel:', error);
    throw error;
  }
};

export const exportLearningResourcesToExcel = async (resources) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Prepare resources data
    const resourcesData = resources.map(resource => ({
      'Resource ID': resource.id,
      'Title': resource.title,
      'Type': resource.type,
      'Category': resource.category,
      'Description': resource.description,
      'File Size': resource.fileSize ? `${(resource.fileSize / 1024 / 1024).toFixed(2)} MB` : '',
      'Downloads': resource.downloadCount || 0,
      'Uploaded By': resource.uploadedBy,
      'Upload Date': resource.createdAt ? format(resource.createdAt, 'yyyy-MM-dd HH:mm') : '',
      'Status': resource.status
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(resourcesData);
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Resource ID
      { wch: 30 }, // Title
      { wch: 15 }, // Type
      { wch: 15 }, // Category
      { wch: 50 }, // Description
      { wch: 15 }, // File Size
      { wch: 10 }, // Downloads
      { wch: 20 }, // Uploaded By
      { wch: 20 }, // Upload Date
      { wch: 15 }  // Status
    ];
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Learning Resources');
    
    // Generate filename with current date
    const fileName = `learning_resources_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Save file
    XLSX.writeFile(workbook, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting learning resources to Excel:', error);
    throw error;
  }
};

// Export employee data to Excel
export const exportEmployeesToExcel = async (employees) => {
  try {
    const workbook = XLSX.utils.book_new();
    
    // Prepare employees data
    const employeesData = employees.map(employee => ({
      'Employee ID': employee.id,
      'Name': employee.displayName || employee.email,
      'Email': employee.email,
      'Role': employee.role,
      'Department': employee.department || '',
      'Position': employee.position || '',
      'Phone': employee.phone || '',
      'Batch': employee.batch || '',
      'Join Date': employee.joinDate ? format(employee.joinDate, 'yyyy-MM-dd') : '',
      'Status': employee.status || 'Active',
      'Last Login': employee.lastLogin ? format(employee.lastLogin, 'yyyy-MM-dd HH:mm') : ''
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(employeesData);
    
    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Employee ID
      { wch: 25 }, // Name
      { wch: 30 }, // Email
      { wch: 10 }, // Role
      { wch: 15 }, // Department
      { wch: 20 }, // Position
      { wch: 15 }, // Phone
      { wch: 15 }, // Batch
      { wch: 15 }, // Join Date
      { wch: 10 }, // Status
      { wch: 20 }  // Last Login
    ];
    worksheet['!cols'] = columnWidths;
    
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    
    // Generate filename with current date
    const fileName = `employees_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    
    // Save file
    XLSX.writeFile(workbook, fileName);
    
    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting employees to Excel:', error);
    throw error;
  }
};

// Create comprehensive report with multiple sheets
export const createComprehensiveReport = async (startDate, endDate) => {
  try {
    const workbook = XLSX.utils.book_new();

    // Attendance sheet
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const attendanceSnapshot = await getDocs(attendanceQuery);
    const attendanceData = [];
    
    attendanceSnapshot.forEach((doc) => {
      const data = doc.data();
      attendanceData.push({
        'Employee ID': data.employeeId,
        'Employee Name': data.employeeName,
        'Date': data.date.toDate().toLocaleDateString(),
        'Check In': data.checkIn ? data.checkIn.toDate().toLocaleTimeString() : 'N/A',
        'Check Out': data.checkOut ? data.checkOut.toDate().toLocaleTimeString() : 'N/A',
        'Total Hours': data.totalHours || 0,
        'Status': data.status
      });
    });

    if (attendanceData.length > 0) {
      const attendanceSheet = XLSX.utils.json_to_sheet(attendanceData);
      XLSX.utils.book_append_sheet(workbook, attendanceSheet, 'Attendance');
    }

    // Tasks sheet
    const tasksQuery = query(
      collection(db, 'tasks'),
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate),
      orderBy('createdAt', 'desc')
    );
    const tasksSnapshot = await getDocs(tasksQuery);
    const tasksData = [];
    
    tasksSnapshot.forEach((doc) => {
      const data = doc.data();
      tasksData.push({
        'Task ID': doc.id,
        'Title': data.title,
        'Assigned To': data.assignedTo,
        'Status': data.status,
        'Priority': data.priority,
        'Due Date': data.dueDate ? data.dueDate.toDate().toLocaleDateString() : 'N/A',
        'Created At': data.createdAt.toDate().toLocaleDateString()
      });
    });

    if (tasksData.length > 0) {
      const tasksSheet = XLSX.utils.json_to_sheet(tasksData);
      XLSX.utils.book_append_sheet(workbook, tasksSheet, 'Tasks');
    }

    // Employees sheet
    const employeesSnapshot = await getDocs(collection(db, 'employees'));
    const employeesData = [];
    
    employeesSnapshot.forEach((doc) => {
      const data = doc.data();
      employeesData.push({
        'Employee ID': doc.id,
        'Name': data.name,
        'Email': data.email,
        'Department': data.department,
        'Position': data.position,
        'Status': data.status,
        'Join Date': data.joinDate ? data.joinDate.toDate().toLocaleDateString() : 'N/A'
      });
    });

    if (employeesData.length > 0) {
      const employeesSheet = XLSX.utils.json_to_sheet(employeesData);
      XLSX.utils.book_append_sheet(workbook, employeesSheet, 'Employees');
    }

    const fileName = `comprehensive_report_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error creating comprehensive report:', error);
    return { success: false, error: error.message };
  }
};
