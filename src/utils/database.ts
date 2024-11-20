import CryptoJS from 'crypto-js';
import { format } from 'date-fns';
import { User, Attendance, Task, AuthorizationRequest } from '../types';

const ENCRYPTION_KEY = 'laa-royba-hris-secure-key';

export const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

// Utility functions
export const getCurrentShift = () => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour < 15) return 1;
  if (hour >= 15 && hour < 23) return 2;
  return 3;
};

export const isLate = (checkInTime: string, shift: number) => {
  const checkIn = new Date(`1970-01-01T${checkInTime}`);
  const shiftStarts = new Date(`1970-01-01T${
    shift === 1 ? '07:00' : shift === 2 ? '15:00' : '23:00'
  }`);
  return checkIn > shiftStarts;
};

// Initial users data
const initialUsers = [
  {
    id: '1',
    username: 'hakimmanager',
    password: '123456',
    role: 'manager',
    name: 'Hakim Manager'
  },
  {
    id: '2',
    username: 'hakimkaryawan',
    password: '123456',
    role: 'karyawan',
    name: 'Hakim Karyawan'
  }
];

// Initialize local storage
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', encryptData(initialUsers));
}

if (!localStorage.getItem('tasks')) {
  const initialTasks = {
    '2': {
      id: crypto.randomUUID(),
      userId: '2',
      date: format(new Date(), 'yyyy-MM-dd'),
      shift: getCurrentShift(),
      tasks: [
        { id: '1', title: 'Check-in tamu', completed: false },
        { id: '2', title: 'Pembersihan kamar', completed: false },
        { id: '3', title: 'Laporan shift', completed: false },
      ],
    },
  };
  localStorage.setItem('tasks', encryptData(initialTasks));
}

if (!localStorage.getItem('authRequests')) {
  localStorage.setItem('authRequests', encryptData([]));
}

// Users functions
export const getUsers = () => {
  const encryptedData = localStorage.getItem('users');
  return encryptedData ? decryptData(encryptedData) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('users', encryptData(users));
};

// Tasks functions
export const getTasks = () => {
  const encryptedData = localStorage.getItem('tasks');
  return encryptedData ? decryptData(encryptedData) : {};
};

export const saveTasks = (tasks: Record<string, Task>) => {
  localStorage.setItem('tasks', encryptData(tasks));
};

export const getTodayTasks = (userId: string) => {
  const tasks = getTasks();
  return tasks[userId] || null;
};

export const completeTask = (userId: string, taskId: string) => {
  const tasks = getTasks();
  if (tasks[userId]) {
    tasks[userId].tasks = tasks[userId].tasks.map(task =>
      task.id === taskId
        ? { ...task, completed: true, completedAt: new Date().toISOString() }
        : task
    );
    saveTasks(tasks);
    return tasks[userId];
  }
  return null;
};

// Authorization requests
export const getAuthRequests = () => {
  const encryptedData = localStorage.getItem('authRequests');
  return encryptedData ? decryptData(encryptedData) : [];
};

export const saveAuthRequests = (requests: AuthorizationRequest[]) => {
  localStorage.setItem('authRequests', encryptData(requests));
};

export const requestTaskEdit = (userId: string, taskId: string, reason: string) => {
  const requests = getAuthRequests();
  const newRequest: AuthorizationRequest = {
    id: crypto.randomUUID(),
    userId,
    type: 'edit_checklist',
    status: 'pending',
    message: reason,
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  saveAuthRequests(requests);
  return newRequest;
};

export const requestLeave = (
  userId: string,
  startDate: string,
  endDate: string,
  leaveType: 'sick' | 'annual' | 'other',
  message: string
) => {
  const requests = getAuthRequests();
  const newRequest: AuthorizationRequest = {
    id: crypto.randomUUID(),
    userId,
    type: 'leave_request',
    status: 'pending',
    message,
    startDate,
    endDate,
    leaveType,
    createdAt: new Date().toISOString(),
  };
  requests.push(newRequest);
  saveAuthRequests(requests);
  return newRequest;
};

// Attendance functions
export const getAttendance = () => {
  const encryptedData = localStorage.getItem('attendance');
  return encryptedData ? decryptData(encryptedData) : [];
};

export const saveAttendance = (attendance: Attendance[]) => {
  localStorage.setItem('attendance', encryptData(attendance));
};

export const getTodayAttendance = (userId: string) => {
  const attendance = getAttendance();
  const today = format(new Date(), 'yyyy-MM-dd');
  return attendance.find(
    (a: Attendance) => a.userId === userId && a.date === today
  );
};

export const checkIn = (userId: string) => {
  const attendance = getAttendance();
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = format(new Date(), 'HH:mm:ss');
  const currentShift = getCurrentShift();

  const todayAttendance = {
    id: crypto.randomUUID(),
    userId,
    date: today,
    checkIn: now,
    checkOut: null,
    status: isLate(now, currentShift) ? 'terlambat' : 'hadir',
    shift: currentShift,
  };

  attendance.push(todayAttendance);
  saveAttendance(attendance);
  return todayAttendance;
};

export const checkOut = (userId: string) => {
  const attendance = getAttendance();
  const today = format(new Date(), 'yyyy-MM-dd');
  const now = format(new Date(), 'HH:mm:ss');

  const index = attendance.findIndex(
    (a: Attendance) => a.userId === userId && a.date === today
  );

  if (index !== -1) {
    attendance[index].checkOut = now;
    saveAttendance(attendance);
    return attendance[index];
  }
  return null;
};