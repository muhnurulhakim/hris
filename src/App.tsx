import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';

// Lazy load pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Absensi = React.lazy(() => import('./pages/Absensi'));
const Izin = React.lazy(() => import('./pages/Izin'));
const Pengaturan = React.lazy(() => import('./pages/Pengaturan'));

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Dashboard />
                </React.Suspense>
              </Layout>
            }
          />
          <Route
            path="/absensi"
            element={
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Absensi />
                </React.Suspense>
              </Layout>
            }
          />
          <Route
            path="/izin"
            element={
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Izin />
                </React.Suspense>
              </Layout>
            }
          />
          <Route
            path="/pengaturan"
            element={
              <Layout>
                <React.Suspense fallback={<div>Loading...</div>}>
                  <Pengaturan />
                </React.Suspense>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;