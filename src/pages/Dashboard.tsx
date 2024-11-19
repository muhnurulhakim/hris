import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock, UserCheck, AlertTriangle, Award } from 'lucide-react';

const mockAttendanceData = [
  { name: 'Senin', tepat: 12, terlambat: 3 },
  { name: 'Selasa', tepat: 15, terlambat: 1 },
  { name: 'Rabu', tepat: 13, terlambat: 2 },
  { name: 'Kamis', tepat: 14, terlambat: 1 },
  { name: 'Jumat', tepat: 11, terlambat: 4 },
  { name: 'Sabtu', tepat: 16, terlambat: 0 },
  { name: 'Minggu', tepat: 14, terlambat: 2 },
];

const StatCard = ({ icon: Icon, title, value, description, color }: any) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
      <div className="ml-4">
        <h3 className="text-gray-500 text-sm">{title}</h3>
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-gray-600 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={UserCheck}
          title="Total Kehadiran"
          value="95%"
          description="Bulan ini"
          color="text-green-600"
        />
        <StatCard
          icon={Clock}
          title="Rata-rata Jam Masuk"
          value="07:15"
          description="Shift Pagi"
          color="text-blue-600"
        />
        <StatCard
          icon={AlertTriangle}
          title="Keterlambatan"
          value="3"
          description="Minggu ini"
          color="text-yellow-600"
        />
        <StatCard
          icon={Award}
          title="Performa"
          value="92%"
          description="Berdasarkan checklist"
          color="text-purple-600"
        />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Statistik Kehadiran Mingguan</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAttendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="tepat" name="Tepat Waktu" fill="#059669" />
              <Bar dataKey="terlambat" name="Terlambat" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {user.role === 'manager' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Karyawan Terbaik Minggu Ini</h2>
          <div className="space-y-4">
            {[
              { name: 'Ahmad Syafiq', performance: '98%', department: 'Front Office' },
              { name: 'Sarah Amalia', performance: '96%', department: 'Housekeeping' },
              { name: 'Budi Santoso', performance: '95%', department: 'F&B Service' },
            ].map((employee, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div>
                  <h3 className="font-medium">{employee.name}</h3>
                  <p className="text-sm text-gray-500">{employee.department}</p>
                </div>
                <div className="text-green-600 font-semibold">{employee.performance}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}