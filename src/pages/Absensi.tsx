import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import {
  getTodayAttendance,
  checkIn,
  checkOut,
  getCurrentShift,
  getAttendance,
} from '../utils/database';
import type { Attendance } from '../types';

export default function Absensi() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadAttendance = () => {
      const today = getTodayAttendance(user.id);
      setTodayAttendance(today || null);

      const history = getAttendance().filter(
        (a: Attendance) => a.userId === user.id
      );
      setAttendanceHistory(history);
    };

    loadAttendance();
  }, [user.id]);

  const handleCheckIn = () => {
    const attendance = checkIn(user.id);
    setTodayAttendance(attendance);
    setAttendanceHistory([...attendanceHistory, attendance]);
  };

  const handleCheckOut = () => {
    const attendance = checkOut(user.id);
    if (attendance) {
      setTodayAttendance(attendance);
      setAttendanceHistory(
        attendanceHistory.map((a) =>
          a.id === attendance.id ? attendance : a
        )
      );
    }
  };

  const currentShift = getCurrentShift();
  const shiftTimes = {
    1: '07:00 - 15:00',
    2: '15:00 - 23:00',
    3: '23:00 - 07:00',
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Absensi</h1>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {format(currentTime, 'EEEE, dd MMMM yyyy')}
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {format(currentTime, 'HH:mm:ss')}
          </p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold">Shift Saat Ini</h2>
            <p className="text-gray-600">
              Shift {currentShift} ({shiftTimes[currentShift as keyof typeof shiftTimes]})
            </p>
          </div>
          <Clock className="w-8 h-8 text-blue-600" />
        </div>

        <div className="flex space-x-4">
          <button
            onClick={handleCheckIn}
            disabled={!!todayAttendance?.checkIn}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
              todayAttendance?.checkIn
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            <span>Check In</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={!todayAttendance?.checkIn || !!todayAttendance?.checkOut}
            className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center space-x-2 ${
              !todayAttendance?.checkIn || todayAttendance?.checkOut
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <XCircle className="w-5 h-5" />
            <span>Check Out</span>
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Riwayat Absensi</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shift
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Check Out
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceHistory.map((attendance) => (
                <tr key={attendance.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendance.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendance.shift}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendance.checkIn || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {attendance.checkOut || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        attendance.status === 'hadir'
                          ? 'bg-green-100 text-green-800'
                          : attendance.status === 'terlambat'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {attendance.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}