import CryptoJS from 'crypto-js';
import { format } from 'date-fns';
import { User, Attendance } from '../types';

const ENCRYPTION_KEY = 'laa-royba-hris-secure-key';

export const encryptData = (data: any) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
};

export const decryptData = (encryptedData: string) => {
  const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
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

// Initialize local storage with encrypted data if not exists
if (!localStorage.getItem('users')) {
  localStorage.setItem('users', encryptData(initialUsers));
}

export const getUsers = () => {
  const encryptedData = localStorage.getItem('users');
  return encryptedData ? decryptData(encryptedData) : [];
};

export const saveUsers = (users: User[]) => {
  localStorage.setItem('users', encryptData(users));
};

// Attendance functions
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