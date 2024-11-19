export interface User {
  id: string;
  username: string;
  password: string;
  role: 'manager' | 'karyawan';
  name: string;
}

export interface Attendance {
  id: string;
  userId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: 'belum_hadir' | 'hadir' | 'terlambat' | 'libur';
  shift: 1 | 2 | 3;
}

export interface Task {
  id: string;
  userId: string;
  date: string;
  shift: 1 | 2 | 3;
  tasks: {
    id: string;
    title: string;
    completed: boolean;
    completedAt?: string;
  }[];
}

export interface AuthorizationRequest {
  id: string;
  userId: string;
  type: 'edit_checklist' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  createdAt: string;
  response?: string;
  respondedAt?: string;
}