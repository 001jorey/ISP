import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import CustomerPortal from './pages/CustomerPortal';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-500 p-0.5 shadow-neon-emerald animate-pulse">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <div className="loading-spinner" />
          </div>
        </div>
        <p className="text-xs font-mono text-emerald-400">Booting KijaniLink Core Engine...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(16px)',
            color: '#ffffff',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '16px',
            fontSize: '12px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />

      <Routes>
        {/* Public Customer Captive Portal */}
        <Route path="/" element={<CustomerPortal />} />
        <Route path="/portal" element={<CustomerPortal />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/*" 
          element={
            user && ['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin/login" replace />
            )
          } 
        />
        
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default App;
