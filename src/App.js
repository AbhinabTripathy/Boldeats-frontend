import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Layout from './components/Layout';
import VendorLayout from './components/VendorLayout';
import Dashboard from './components/Dashboard';
import PaymentsScreen from './components/PaymentsScreen';
import OrdersScreen from './components/OrdersScreen';
import UsersScreen from './components/UsersScreen';
import ActiveUsersScreen from './components/SubscribedUsersScreen';
import VendorScreen from './components/VendorScreen';
import PastSubscribersScreen from './components/PastSubscribersScreen';
import Login from './components/Login';
import VendorProfile from './components/VendorProfile';
import { UserProvider } from './contexts/UserContext';
import { VendorProvider } from './contexts/VendorContext';
import VendorDashboard from './components/VendorDashboard';
import VendorPayments from './components/VendorPayments';
import VendorOrders from './components/VendorOrders';
import VendorActiveUsers from './components/VendorActiveUsers';
import VendorPastSubscribers from './components/VendorPastSubscribers';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

// Check if user is authenticated
const isAdminAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

const isVendorAuthenticated = () => {
  return localStorage.getItem('isVendorAuthenticated') === 'true';
};

// Protected route components
const AdminProtectedRoute = ({ children }) => {
  if (isVendorAuthenticated()) {
    return <Navigate to="/vendor" />;
  }
  if (!isAdminAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <Layout>{children}</Layout>;
};

const VendorProtectedRoute = ({ children }) => {
  if (isAdminAuthenticated()) {
    return <Navigate to="/" />;
  }
  if (!isVendorAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <VendorLayout>{children}</VendorLayout>;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <VendorProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              {/* Admin Routes */}
              <Route
                path="/"
                element={
                  <AdminProtectedRoute>
                    <Dashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/payments"
                element={
                  <AdminProtectedRoute>
                    <PaymentsScreen />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <AdminProtectedRoute>
                    <OrdersScreen />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <AdminProtectedRoute>
                    <UsersScreen />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/subscribed-users"
                element={
                  <AdminProtectedRoute>
                    <ActiveUsersScreen />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/past-subscribers"
                element={
                  <AdminProtectedRoute>
                    <PastSubscribersScreen />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/vendors"
                element={
                  <AdminProtectedRoute>
                    <VendorScreen />
                  </AdminProtectedRoute>
                }
              />

              {/* Vendor Routes */}
              <Route
                path="/vendor"
                element={
                  <VendorProtectedRoute>
                    <VendorDashboard />
                  </VendorProtectedRoute>
                }
              />
              <Route
                path="/vendor/payments"
                element={
                  <VendorProtectedRoute>
                    <VendorPayments />
                  </VendorProtectedRoute>
                }
              />
              <Route
                path="/vendor/orders"
                element={
                  <VendorProtectedRoute>
                    <VendorOrders />
                  </VendorProtectedRoute>
                }
              />
              <Route
                path="/vendor/active-users"
                element={
                  <VendorProtectedRoute>
                    <VendorActiveUsers />
                  </VendorProtectedRoute>
                }
              />
              <Route
                path="/vendor/past-subscribers"
                element={
                  <VendorProtectedRoute>
                    <VendorPastSubscribers />
                  </VendorProtectedRoute>
                }
              />
              <Route
                path="/vendor/profile"
                element={
                  <VendorProtectedRoute>
                    <VendorProfile />
                  </VendorProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </VendorProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
