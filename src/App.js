import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, Box } from '@mui/material';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PaymentsScreen from './components/PaymentsScreen';
import OrdersScreen from './components/OrdersScreen';
import UsersScreen from './components/UsersScreen';
import NotificationsScreen from './components/NotificationsScreen';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ActiveUsersScreen from './components/SubscribedUsersScreen';
import VendorScreen from './components/VendorScreen';
import PastSubscribersScreen from './components/PastSubscribersScreen';
import Login from './components/Login';
import { UserProvider } from './contexts/UserContext';
import { VendorProvider } from './contexts/VendorContext';

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
const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true';
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return children;
};

const AppContent = () => {
  const location = useLocation();
  const isNotificationsPage = location.pathname === '/notifications';

  if (isNotificationsPage) {
    return (
      <Box sx={{ minHeight: '100vh' }}>
        <Header />
        <NotificationsScreen />
      </Box>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/payments" element={<PaymentsScreen />} />
        <Route path="/orders" element={<OrdersScreen />} />
        <Route path="/users" element={<UsersScreen />} />
        <Route path="/subscribed-users" element={<ActiveUsersScreen />} />
        <Route path="/past-subscribers" element={<PastSubscribersScreen />} />
        <Route path="/vendors" element={<VendorScreen />} />
      </Routes>
    </Layout>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <UserProvider>
        <VendorProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div style={{ display: 'flex' }}>
                      <Sidebar />
                      <Routes>
                        <Route path="/notifications" element={<AppContent />} />
                        <Route path="/*" element={<AppContent />} />
                      </Routes>
                    </div>
                  </ProtectedRoute>
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
