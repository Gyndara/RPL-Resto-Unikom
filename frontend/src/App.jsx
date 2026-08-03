import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Customer Pages
import CustomerLanding from './pages/customer/CustomerLanding';
import CustomerMenu from './pages/customer/CustomerMenu';
import CustomerCart from './pages/customer/CustomerCart';
import CustomerOrderStatus from './pages/customer/CustomerOrderStatus';

// Waiter Pages
import WaiterTables from './pages/waiter/WaiterTables';
import WaiterNotifications from './pages/waiter/WaiterNotifications';

// Chef Pages
import ChefKitchen from './pages/chef/ChefKitchen';
import ChefMenuManagement from './pages/chef/ChefMenuManagement';

// Cashier Pages
import CashierPayments from './pages/cashier/CashierPayments';

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard';
import ManagerReports from './pages/manager/ManagerReports';
import ManagerRegisterStaff from './pages/manager/ManagerRegisterStaff';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component for Staff Roles
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect staff to their assigned role homepage
    switch (user.role) {
      case 'pelayan':
        return <Navigate to="/waiter" replace />;
      case 'chef':
        return <Navigate to="/chef" replace />;
      case 'kasir':
        return <Navigate to="/cashier" replace />;
      case 'manager':
        return <Navigate to="/manager" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return children;
}

// Root Home Index Redirect
function RootRedirect() {
  const { user } = useAuth();
  if (user) {
    switch (user.role) {
      case 'pelayan':
        return <Navigate to="/waiter" replace />;
      case 'chef':
        return <Navigate to="/chef" replace />;
      case 'kasir':
        return <Navigate to="/cashier" replace />;
      case 'manager':
        return <Navigate to="/manager" replace />;
      default:
        return <Navigate to="/customer" replace />;
    }
  }
  return <Navigate to="/customer" replace />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1E293B',
                color: '#fff',
                borderRadius: '16px',
                fontSize: '13px',
                fontWeight: '600',
              },
            }}
          />

          <Routes>
            {/* Root Redirect */}
            <Route path="/" element={<RootRedirect />} />

            {/* Staff Login */}
            <Route path="/login" element={<Login />} />

            {/* Customer Ordering Routes */}
            <Route path="/customer" element={<CustomerLayout />}>
              <Route index element={<CustomerLanding />} />
              <Route path="menu" element={<CustomerMenu />} />
              <Route path="cart" element={<CustomerCart />} />
              <Route path="status" element={<CustomerOrderStatus />} />
            </Route>

            {/* Waiter Staff Routes */}
            <Route
              path="/waiter"
              element={
                <ProtectedRoute allowedRoles={['pelayan', 'manager']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<WaiterTables />} />
              <Route path="tables" element={<WaiterTables />} />
              <Route path="notifications" element={<WaiterNotifications />} />
            </Route>

            {/* Chef Kitchen Routes */}
            <Route
              path="/chef"
              element={
                <ProtectedRoute allowedRoles={['chef', 'manager']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ChefKitchen />} />
              <Route path="menu" element={<ChefMenuManagement />} />
            </Route>

            {/* Cashier Payment Routes */}
            <Route
              path="/cashier"
              element={
                <ProtectedRoute allowedRoles={['kasir', 'manager']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<CashierPayments />} />
              <Route path="reports" element={<ManagerReports />} />
            </Route>

            {/* Manager Analytics Routes */}
            <Route
              path="/manager"
              element={
                <ProtectedRoute allowedRoles={['manager']}>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<ManagerDashboard />} />
              <Route path="reports" element={<ManagerReports />} />
              <Route path="register" element={<ManagerRegisterStaff />} />
            </Route>

            {/* Fallback Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
