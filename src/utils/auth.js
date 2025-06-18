import { Navigate } from 'react-router-dom';

// Function to handle token expiration
export const handleTokenExpiration = () => {
  // Clear any stored tokens
  localStorage.removeItem('adminToken');
  localStorage.removeItem('vendorToken');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Function to check if token is expired
export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    // Decode the token (assuming it's a JWT)
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const { exp } = JSON.parse(jsonPayload);
    
    // Check if token is expired
    return exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
};

// Function to get the current user's token
export const getCurrentToken = () => {
  const adminToken = localStorage.getItem('adminToken');
  const vendorToken = localStorage.getItem('vendorToken');
  
  if (adminToken && !isTokenExpired(adminToken)) {
    return { token: adminToken, type: 'admin' };
  }
  
  if (vendorToken && !isTokenExpired(vendorToken)) {
    return { token: vendorToken, type: 'vendor' };
  }
  
  return null;
};

// Higher-order component to protect routes
export const withAuth = (WrappedComponent) => {
  return function WithAuthComponent(props) {
    const token = getCurrentToken();
    
    if (!token) {
      handleTokenExpiration();
      return null;
    }
    
    return <WrappedComponent {...props} />;
  };
};

// Function to handle API responses for token expiration
export const handleApiResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    handleTokenExpiration();
    return null;
  }
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Request failed');
  }
  
  return response.json();
}; 