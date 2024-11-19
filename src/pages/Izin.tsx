import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Izin() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Izin</h1>
      <div className="bg-white shadow rounded-lg p-6">
        <p>Halaman Izin - Dalam Pengembangan</p>
      </div>
    </div>
  );
}