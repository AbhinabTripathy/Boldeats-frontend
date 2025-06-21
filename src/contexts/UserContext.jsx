import React, { createContext, useState, useEffect, useContext } from 'react';
import { handleApiResponse } from '../utils/auth';

// // Sample user data - in a real app, this would come from an API
// const sampleUsers = [
//   {
//     id: 'USER001',
//     name: 'John Doe',
//     email: 'john.doe@example.com',
//     phone: '9876543210',
//     address: '42, Park Street, Mumbai, Maharashtra - 400001',
//     joinDate: new Date(2023, 1, 15),
//     status: 'active',
//     subscriptionStatus: 'active',
//     orders: ['ORD002', 'ORD007', 'ORD015'],
//     payments: ['PAY001', 'PAY008'],
//     profilePic: 'https://randomuser.me/api/portraits/men/1.jpg',
//   },
//   {
//     id: 'USER002',
//     name: 'Jane Smith',
//     email: 'jane.smith@example.com',
//     phone: '8765432109',
//     address: '15, MG Road, Bangalore, Karnataka - 560001',
//     joinDate: new Date(2023, 2, 22),
//     status: 'active',
//     subscriptionStatus: 'active',
//     orders: ['ORD003', 'ORD010'],
//     payments: ['PAY002'],
//     profilePic: 'https://randomuser.me/api/portraits/women/2.jpg',
//   },
//   {
//     id: 'USER003',
//     name: 'Rajesh Kumar',
//     email: 'rajesh.kumar@example.com',
//     phone: '7654321098',
//     address: '78, Civil Lines, New Delhi - 110001',
//     joinDate: new Date(2023, 3, 10),
//     status: 'inactive',
//     subscriptionStatus: 'expired',
//     orders: ['ORD004', 'ORD011', 'ORD018'],
//     payments: ['PAY003', 'PAY009'],
//     profilePic: 'https://randomuser.me/api/portraits/men/3.jpg',
//   },
//   {
//     id: 'USER004',
//     name: 'Priya Sharma',
//     email: 'priya.sharma@example.com',
//     phone: '6543210987',
//     address: '23, Anna Salai, Chennai, Tamil Nadu - 600002',
//     joinDate: new Date(2023, 4, 5),
//     status: 'active',
//     subscriptionStatus: 'active',
//     orders: ['ORD005', 'ORD012'],
//     payments: ['PAY004'],
//     profilePic: 'https://randomuser.me/api/portraits/women/4.jpg',
//   },
//   {
//     id: 'USER005',
//     name: 'Amit Patel',
//     email: 'amit.patel@example.com',
//     phone: '5432109876',
//     address: '56, Salt Lake, Kolkata, West Bengal - 700064',
//     joinDate: new Date(2023, 5, 17),
//     status: 'active',
//     subscriptionStatus: 'active',
//     orders: ['ORD006', 'ORD013', 'ORD020'],
//     payments: ['PAY005', 'PAY010'],
//     profilePic: 'https://randomuser.me/api/portraits/men/5.jpg',
//   }
// ];

// Create the context
const UserContext = createContext();

// Provider component
export const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found. Please login again.');
      const response = await fetch('https://api.boldeats.in/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await handleApiResponse(response);
      if (!data) return; // Token expired, handleApiResponse already handled the redirect
      
      // Ensure data is always an array
      let usersArray = [];
      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data && Array.isArray(data.data)) {
        usersArray = data.data;
      }
      // Map users to ensure joinDate is a valid date string or null
      usersArray = usersArray.map(user => ({
        ...user,
        joinDate: user.joinDate && !isNaN(new Date(user.joinDate)) ? user.joinDate : null
      }));
      setUsers(usersArray);
    } catch (err) {
      setError('Failed to load users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Function to get a specific user by ID
  const getUserById = (userId) => {
    return users.find(user => user.id === userId) || null;
  };

  // Function to update a user
  const updateUser = (userId, updatedData) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, ...updatedData } : user
      )
    );
  };

  // Function to fetch active users
  const fetchActiveUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found. Please login again.');
      const response = await fetch('https://api.boldeats.in/api/admin/users/active', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await handleApiResponse(response);
      if (!data) return []; // Token expired, handleApiResponse already handled the redirect
      
      let usersArray = [];
      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data && Array.isArray(data.data)) {
        usersArray = data.data;
      }
      // Normalize user fields for table display
      usersArray = usersArray.map(user => ({
        id: user.id || user._id || user.userId || '-',
        name: user.name || user.fullName || '-',
        phone: user.phone || user.phoneNumber || '-',
        email: user.email || '-',
        address: user.address || '-',
        joinDate: user.joinDate && !isNaN(new Date(user.joinDate)) ? user.joinDate : null,
        profilePic: user.profilePic || user.avatar || '',
        ...user
      }));
      return usersArray;
    } catch (err) {
      console.error('Error fetching active users:', err);
      return [];
    }
  };

  // Load users on component mount
  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('adminToken');
        if (!token) throw new Error('No authentication token found. Please login again.');
        const response = await fetch('https://api.boldeats.in/api/admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await handleApiResponse(response);
        if (!data) return; // Token expired, handleApiResponse already handled the redirect
        
        if (isMounted) {
          // Ensure data is always an array
          let usersArray = [];
          if (Array.isArray(data)) {
            usersArray = data;
          } else if (data && Array.isArray(data.data)) {
            usersArray = data.data;
          }
          // Map users to ensure joinDate is a valid date string or null
          usersArray = usersArray.map(user => ({
            ...user,
            joinDate: user.joinDate && !isNaN(new Date(user.joinDate)) ? user.joinDate : null
          }));
          setUsers(usersArray);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load users. Please try again later.');
          console.error('Error fetching users:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  // Context value
  const value = React.useMemo(() => ({
    users,
    loading,
    error,
    fetchUsers,
    getUserById,
    updateUser,
    fetchActiveUsers
  }), [users, loading, error]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook for using the context
export const useUsers = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUsers must be used within a UserProvider');
  }
  return context;
};

export default UserContext; 