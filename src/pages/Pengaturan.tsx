import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Download, Key, Save } from 'lucide-react';
import { getUsers, saveUsers, getAttendance, exportToExcel } from '../utils/database';
import type { User } from '../types';

export default function Pengaturan() {
  const { user, updatePassword } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    name: '',
    role: 'karyawan',
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [exportMonth, setExportMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );

  useEffect(() => {
    if (user.role === 'manager') {
      setUsers(getUsers());
    }
  }, [user.role]);

  const handleAddUser = () => {
    if (newUser.username && newUser.password && newUser.name) {
      const updatedUsers = [
        ...users,
        {
          id: crypto.randomUUID(),
          ...newUser,
        },
      ];
      saveUsers(updatedUsers);
      setUsers(updatedUsers);
      setNewUser({
        username: '',
        password: '',
        name: '',
        role: 'karyawan',
      });
      setMessage('Pengguna berhasil ditambahkan');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = users.filter((u) => u.id !== userId);
    saveUsers(updatedUsers);
    setUsers(updatedUsers);
    setMessage('Pengguna berhasil dihapus');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setMessage('Password baru tidak cocok');
      return;
    }

    if (updatePassword(currentPassword, newPassword)) {
      setMessage('Password berhasil diubah');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setMessage('Password saat ini salah');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const handleExport = () => {
    const attendance = getAttendance();
    exportToExcel(attendance, exportMonth);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pengaturan</h1>

      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg">
          {message}
        </div>
      )}

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Key className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Ubah Password</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Saat Ini
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password Baru
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Konfirmasi Password Baru
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <button
            onClick={handlePasswordChange}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Ubah Password
          </button>
        </div>
      </div>

      {user.role === 'manager' && (
        <>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Kelola Pengguna</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <input
                  placeholder="Username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  className="p-2 border rounded-lg"
                />
                <input
                  placeholder="Password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  className="p-2 border rounded-lg"
                />
                <input
                  placeholder="Nama Lengkap"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="p-2 border rounded-lg"
                />
                <button
                  onClick={handleAddUser}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Tambah Pengguna
                </button>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Daftar Pengguna</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Username
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nama
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Role
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((u) => (
                        <tr key={u.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.username}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.role === 'manager' ? 'Manager' : 'Karyawan'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {u.role !== 'manager' && (
                              <button
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Hapus
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Download className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Export Data</h2>
            </div>
            <div className="flex items-center space-x-4">
              <input
                type="month"
                value={exportMonth}
                onChange={(e) => setExportMonth(e.target.value)}
                className="p-2 border rounded-lg"
              />
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Absensi</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}