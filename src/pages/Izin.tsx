import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { MessageSquare, Check, X, Plus, Calendar } from 'lucide-react';
import { getAuthRequests, saveAuthRequests, requestLeave, getUsers } from '../utils/database';
import type { AuthorizationRequest, User } from '../types';

export default function Izin() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<AuthorizationRequest[]>([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    startDate: '',
    endDate: '',
    leaveType: 'annual',
    message: '',
  });
  const [users, setUsers] = useState<Record<string, User>>({});

  useEffect(() => {
    const loadData = () => {
      const allRequests = getAuthRequests();
      if (user.role === 'manager') {
        setRequests(allRequests);
      } else {
        setRequests(allRequests.filter(req => req.userId === user.id));
      }

      // Create users lookup object
      const usersList = getUsers();
      const usersMap = usersList.reduce((acc: Record<string, User>, user: User) => {
        acc[user.id] = user;
        return acc;
      }, {});
      setUsers(usersMap);
    };

    loadData();
    // Poll for new requests every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleRequestAction = (requestId: string, approved: boolean, response?: string) => {
    const allRequests = getAuthRequests();
    const updatedRequests = allRequests.map(req =>
      req.id === requestId
        ? {
            ...req,
            status: approved ? 'approved' : 'rejected',
            response: response || (approved ? 'Disetujui' : 'Ditolak'),
            respondedAt: new Date().toISOString(),
          }
        : req
    );
    saveAuthRequests(updatedRequests);
    setRequests(
      user.role === 'manager'
        ? updatedRequests
        : updatedRequests.filter(req => req.userId === user.id)
    );
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (leaveForm.startDate && leaveForm.endDate && leaveForm.message) {
      requestLeave(
        user.id,
        leaveForm.startDate,
        leaveForm.endDate,
        leaveForm.leaveType as 'sick' | 'annual' | 'other',
        leaveForm.message
      );
      setShowLeaveModal(false);
      setLeaveForm({
        startDate: '',
        endDate: '',
        leaveType: 'annual',
        message: '',
      });
      // Refresh requests
      const allRequests = getAuthRequests();
      setRequests(allRequests.filter(req => req.userId === user.id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Izin & Otorisasi</h1>
        <div className="flex items-center space-x-4">
          {user.role === 'karyawan' && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Izin</span>
            </button>
          )}
          <MessageSquare className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">
          {user.role === 'manager' ? 'Permintaan Otorisasi' : 'Riwayat Permintaan'}
        </h2>
        
        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Tidak ada permintaan otorisasi
            </p>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="border rounded-lg p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {request.type === 'edit_checklist'
                          ? 'Edit Checklist'
                          : request.type === 'leave_request'
                          ? 'Pengajuan Izin'
                          : 'Permintaan Lain'}
                      </p>
                      {user.role === 'manager' && (
                        <span className="text-sm text-gray-500">
                          oleh {users[request.userId]?.name || 'Unknown'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(request.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      request.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : request.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status === 'pending'
                      ? 'Menunggu'
                      : request.status === 'approved'
                      ? 'Disetujui'
                      : 'Ditolak'}
                  </span>
                </div>
                
                <p className="text-gray-600">{request.message}</p>

                {request.type === 'leave_request' && request.startDate && request.endDate && (
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {new Date(request.startDate).toLocaleDateString('id-ID')} -{' '}
                      {new Date(request.endDate).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                )}

                {request.response && (
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium">Respon:</p>
                    <p className="text-gray-600">{request.response}</p>
                  </div>
                )}

                {user.role === 'manager' && request.status === 'pending' && (
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => handleRequestAction(request.id, true)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                    >
                      <Check className="w-4 h-4" />
                      <span>Setuju</span>
                    </button>
                    <button
                      onClick={() => handleRequestAction(request.id, false)}
                      className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                    >
                      <X className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                )}

                {request.respondedAt && (
                  <p className="text-sm text-gray-500">
                    Direspon pada: {new Date(request.respondedAt).toLocaleString('id-ID')}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {showLeaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Pengajuan Izin</h3>
            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Izin
                </label>
                <select
                  value={leaveForm.leaveType}
                  onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                >
                  <option value="annual">Cuti Tahunan</option>
                  <option value="sick">Sakit</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={leaveForm.startDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Selesai
                </label>
                <input
                  type="date"
                  value={leaveForm.endDate}
                  onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Keterangan
                </label>
                <textarea
                  value={leaveForm.message}
                  onChange={(e) => setLeaveForm({ ...leaveForm, message: e.target.value })}
                  className="w-full p-2 border rounded-lg"
                  rows={4}
                  placeholder="Jelaskan alasan pengajuan izin..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLeaveModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kirim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}