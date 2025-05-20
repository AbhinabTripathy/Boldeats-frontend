import React, { createContext, useState, useEffect, useContext } from 'react';

// Sample vendor data - in a real app, this would come from an API
const sampleVendors = [
  { 
    id: 'VEND001', 
    name: 'Fresh Farms', 
    phoneNumber: '9876543210', 
    joinedDate: new Date(2023, 0, 10), 
    status: 'Active', 
    ordersCount: 23, 
    paymentStatus: 'Paid',
    address: '123 Farm Lane, Mumbai, Maharashtra',
    email: 'contact@freshfarms.in',
    logo: 'https://via.placeholder.com/150?text=Fresh+Farms',
    cuisineType: 'Vegetarian',
    rating: 4.5
  },
  { 
    id: 'VEND002', 
    name: 'Organic Meals', 
    phoneNumber: '8765432109', 
    joinedDate: new Date(2023, 1, 15), 
    status: 'Active', 
    ordersCount: 16, 
    paymentStatus: 'Unpaid',
    address: '456 Organic Street, Bangalore, Karnataka',
    email: 'info@organicmeals.in',
    logo: 'https://via.placeholder.com/150?text=Organic+Meals',
    cuisineType: 'Mix',
    rating: 4.2
  },
  { 
    id: 'VEND003', 
    name: 'Spice World', 
    phoneNumber: '7654321098', 
    joinedDate: new Date(2023, 2, 5), 
    status: 'Inactive', 
    ordersCount: 32, 
    paymentStatus: 'Paid',
    address: '789 Spice Road, Delhi, Delhi',
    email: 'orders@spiceworld.in',
    logo: 'https://via.placeholder.com/150?text=Spice+World',
    cuisineType: 'Non-Vegetarian',
    rating: 3.9
  },
  { 
    id: 'VEND004', 
    name: 'Healthy Choices', 
    phoneNumber: '6543210987', 
    joinedDate: new Date(2023, 0, 25), 
    status: 'Active', 
    ordersCount: 18, 
    paymentStatus: 'Unpaid',
    address: '101 Health Avenue, Chennai, Tamil Nadu',
    email: 'support@healthychoices.in',
    logo: 'https://via.placeholder.com/150?text=Healthy+Choices',
    cuisineType: 'Vegetarian',
    rating: 4.7
  },
  { 
    id: 'VEND005', 
    name: 'Gourmet Delights', 
    phoneNumber: '5432109876', 
    joinedDate: new Date(2023, 1, 8), 
    status: 'Inactive', 
    ordersCount: 9, 
    paymentStatus: 'Paid',
    address: '202 Gourmet Plaza, Kolkata, West Bengal',
    email: 'hello@gourmetdelights.in',
    logo: 'https://via.placeholder.com/150?text=Gourmet+Delights',
    cuisineType: 'Mix',
    rating: 4.1
  }
];

// Create the context
const VendorContext = createContext();

// Provider component
export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call:
      // const response = await fetch('https://api.example.com/vendors');
      // const data = await response.json();
      
      // Using sample data for demonstration
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setVendors(sampleVendors);
      setLoading(false);
    } catch (err) {
      setError('Failed to load vendors. Please try again later.');
      setLoading(false);
      console.error('Error fetching vendors:', err);
    }
  };

  // Function to get a specific vendor by ID
  const getVendorById = (vendorId) => {
    return vendors.find(vendor => vendor.id === vendorId) || null;
  };

  // Function to update a vendor
  const updateVendor = (vendorId, updatedData) => {
    setVendors(prevVendors => 
      prevVendors.map(vendor => 
        vendor.id === vendorId ? { ...vendor, ...updatedData } : vendor
      )
    );
  };

  // Function to add a new vendor
  const addVendor = (newVendor) => {
    setVendors(prevVendors => [...prevVendors, newVendor]);
  };

  // Function to toggle vendor status
  const toggleVendorStatus = (vendorId) => {
    setVendors(prevVendors => 
      prevVendors.map(vendor => 
        vendor.id === vendorId 
          ? { ...vendor, status: vendor.status === 'Active' ? 'Inactive' : 'Active' } 
          : vendor
      )
    );
  };

  // Function to delete a vendor
  const deleteVendor = (vendorId) => {
    setVendors(prevVendors => prevVendors.filter(vendor => vendor.id !== vendorId));
  };

  // Load vendors on component mount
  useEffect(() => {
    fetchVendors();
  }, []);

  // Context value
  const value = {
    vendors,
    loading,
    error,
    fetchVendors,
    getVendorById,
    updateVendor,
    addVendor,
    toggleVendorStatus,
    deleteVendor
  };

  return (
    <VendorContext.Provider value={value}>
      {children}
    </VendorContext.Provider>
  );
};

// Custom hook for using the context
export const useVendors = () => {
  const context = useContext(VendorContext);
  if (!context) {
    throw new Error('useVendors must be used within a VendorProvider');
  }
  return context;
};

export default VendorContext; 