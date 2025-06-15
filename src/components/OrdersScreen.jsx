import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  IconButton, 
  Stack,
  Chip,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  CalendarToday,
  PictureAsPdf,
  GridOn,
  InsertDriveFile,
  ViewList
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AnimatedTable from './AnimatedTable';
import { format, subDays, startOfDay, isToday, isYesterday } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useUsers } from '../contexts/UserContext';
import { useVendors } from '../contexts/VendorContext';
import axios from 'axios';

// Move helper functions and constants outside component
const ORDER_STATUSES = ['Pending', 'Processing', 'Delivered', 'Cancelled'];
const PAYMENT_STATUSES = ['Paid', 'Pending', 'Failed'];
const ORDER_TYPES = ['Regular', 'Subscription'];

// Function to format number to Indian currency format
const formatIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  // Ensure proper ₹ symbol display by replacing the default INR symbol
  return formatter.replace('INR', '₹').replace('₹ ', '₹');
};

const generateSampleData = () => {
  const names = ['John Doe', 'Jane Smith', 'Raj Patel', 'Priya Sharma', 'Amit Kumar', 'Sarah Wilson', 'Mike Ross', 'Rachel Green', 'Ross Geller', 'Monica Geller'];
  const addresses = [
    '42, Park Street, Mumbai, Maharashtra - 400001',
    '15, MG Road, Bangalore, Karnataka - 560001',
    '78, Civil Lines, New Delhi - 110001',
    '23, Anna Salai, Chennai, Tamil Nadu - 600002',
    '56, Salt Lake, Kolkata, West Bengal - 700064',
    '89, Baner Road, Pune, Maharashtra - 411045',
    '34, Jubilee Hills, Hyderabad, Telangana - 500033',
    '67, Gomti Nagar, Lucknow, Uttar Pradesh - 226010',
    '12, C.G. Road, Ahmedabad, Gujarat - 380009',
    '45, M.I. Road, Jaipur, Rajasthan - 302001'
  ];
  const paymentModes = ['Credit Card', 'UPI', 'Net Banking', 'Debit Card', 'Cash on Delivery'];
  const prices = [1499, 2499, 3499, 4999, 6999, 8999, 999, 1999, 2999, 5999];
  const statuses = ['Pending', 'Accepted', 'Rejected']; // Add different statuses
  
  // Define vendors with both ID and name properties
  const vendors = [
    { id: 'V001', name: 'Restaurant A' },
    { id: 'V002', name: 'Restaurant B' },
    { id: 'V003', name: 'Restaurant C' },
    { id: 'V004', name: 'Restaurant D' },
    { id: 'V005', name: 'Restaurant E' }
  ];
  
  console.log('Sample vendors:', vendors);

  let sampleData = [];
  let id = 1;

  // Generate 15 orders for each of the last 7 days
  for (let day = 0; day < 7; day++) {
    for (let i = 0; i < 15; i++) {
      // For demonstration, randomly assign some orders as already accepted/rejected
      const randomStatus = day === 0 ? 'Pending' : statuses[Math.floor(Math.random() * statuses.length)];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      
      sampleData.push({
        id: id++,
        orderId: `ORD${String(id).padStart(3, '0')}`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        customerName: names[Math.floor(Math.random() * names.length)],
        address: addresses[Math.floor(Math.random() * addresses.length)],
        paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
        price: formatIndianCurrency(prices[Math.floor(Math.random() * prices.length)]),
        status: randomStatus,
        date: subDays(new Date(), day)
      });
    }
  }

  // Debug log a sample of orders
  console.log('Sample of generated orders with vendor IDs:', sampleData.slice(0, 3));
  
  return sampleData;
};

// Function to generate random order data
const generateOrderData = (user, vendor) => {
  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
  
  return {
    orderId: `ORD${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    userId: user.id,
    vendorId: vendor.id,
    customerName: user.name,
    address: user.address,
    status: ORDER_STATUSES[Math.floor(Math.random() * ORDER_STATUSES.length)],
    paymentStatus: PAYMENT_STATUSES[Math.floor(Math.random() * PAYMENT_STATUSES.length)],
    orderType: ORDER_TYPES[Math.floor(Math.random() * ORDER_TYPES.length)],
    date: orderDate,
    amount: Math.floor(Math.random() * 1000) + 500
  };
};

const OrdersScreen = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  
  const { users, loading: usersLoading } = useUsers();
  const { vendors, loading: vendorsLoading } = useVendors();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [approvingOrder, setApprovingOrder] = useState(null);

  // Fetch orders from API
  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }
      const response = await axios.get('https://api.boldeats.in/api/admin/all-daily-orders', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Raw API Response:', response.data);
      
      // Ensure we have an array of orders
      let ordersData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        ordersData = response.data.data.map(order => {
          const subscriber = order.DailyOrderSubscription?.Subscriber;
          const address = subscriber?.Addresses?.[0];
          const vendor = order.DailyOrderSubscription?.VendorSubscription;
          
          return {
            orderId: order.id,
            vendorId: order.vendorId,
            
            userId: subscriber?.id || '-',
            customerName: subscriber?.name || '-',
            
            
            address: address ? `${address.addressLine1}, ${address.addressLine2}, ${address.city}, ${address.state} - ${address.pincode}` : '-',
            status: order.status || 'Pending',
            date: order.date || order.createdAt,
            
            subscriptionId: order.subscriptionId,
            startDate: order.DailyOrderSubscription?.startDate,
            endDate: order.DailyOrderSubscription?.endDate,
            paymentId: order.DailyOrderSubscription?.paymentId,
            subscriptionStatus: order.DailyOrderSubscription?.status
          };
        });
      }
      
      console.log('Processed Orders Data:', ordersData);
      setOrders(ordersData);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to fetch orders. Please try again later.');
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and setup periodic refresh
  useEffect(() => {
    console.log('Initial fetch of orders');
    fetchOrders();
    // Refresh orders every 5 minutes
    const intervalId = setInterval(fetchOrders, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [fetchOrders]);

  // Debug log when orders state changes
  useEffect(() => {
    console.log('Orders state updated:', orders);
  }, [orders]);

  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [activeTab, setActiveTab] = useState(-1); // Set default to -1 for All Orders

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setDateRange({ from: null, to: null }); // Reset date range when tab changes
  };

  // Export functions
  const exportToCSV = () => {
    const filteredOrders = filterDataByDate(orders, activeTab);
    const csvData = filteredOrders.map(order => ({
      'Order ID': order.orderId,
      'Vendor ID': order.vendorId,
      'User ID': order.userId || '-',
      'Customer Name': order.customerName,
      'Address': order.address,
      'Status': order.status,
      'Date': format(order.date, 'dd/MM/yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'orders.csv');
  };

  const exportToPDF = () => {
    const filteredOrders = filterDataByDate(orders, activeTab);
    const doc = new jsPDF();

    // Add Unicode font support for ₹ symbol
    doc.addFont('https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxP.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    const tableColumn = ['Order ID', 'Vendor ID', 'User ID', 'Customer', 'Status', 'Date'];
    const tableRows = filteredOrders.map(order => [
      order.orderId,
      order.vendorId,
      order.userId || '-',
      order.customerName,
      order.status,
      format(order.date, 'dd/MM/yyyy')
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: {
        font: 'Roboto',
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Order ID
        1: { cellWidth: 25 }, // Vendor ID
        2: { cellWidth: 25 }, // User ID
        3: { cellWidth: 35 }, // Customer
        4: { cellWidth: 25 }, // Status
        5: { cellWidth: 25 } // Date
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      }
    });

    doc.save(`orders_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

  const exportToExcel = () => {
    const filteredOrders = filterDataByDate(orders, activeTab);
    const excelData = filteredOrders.map(order => ({
      'Order ID': order.orderId,
      'Vendor ID': order.vendorId,
      'User ID': order.userId || '-',
      'Customer Name': order.customerName,
      'Address': order.address,
      'Status': order.status,
      'Date': format(order.date, 'dd/MM/yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'orders.xlsx');
  };

  const handleAccept = async (orderId) => {
    try {
      setApprovingOrder(orderId);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Find the order to get its subscriptionId
      const order = orders.find(o => o.orderId === orderId);
      if (!order || !order.subscriptionId) {
        throw new Error('Subscription ID not found for this order');
      }

      const response = await axios.patch(
        `https://api.boldeats.in/api/admin/subscriptions/${order.orderId}/approve`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        // Update the order status in the local state
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order.orderId === orderId 
              ? { ...order, status: 'Accepted' }
              : order
          )
        );
      } else {
        throw new Error(response.data.message || 'Failed to approve order');
      }
    } catch (err) {
      console.error('Error approving order:', err);
      setError(err.message || 'Failed to approve order');
    } finally {
      setApprovingOrder(null);
    }
  };

  const handleReject = (orderId) => {
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        // Only change status if it's currently Pending
        if (order.orderId === orderId && order.status === 'Pending') {
          return { ...order, status: 'Rejected' };
        }
        return order;
      });
      return updatedOrders;
    });
  };

  const columns = [
    { 
      id: 'orderId', 
      label: 'Order ID',
      width: 100,
      minWidth: 80
    },
    { 
      id: 'vendorId', 
      label: 'Vendor ID',
      width: 100,
      minWidth: 80,
      render: (row) => row.vendorId || '-'
    },
    { 
      id: 'userId', 
      label: 'User ID',
      width: 100,
      minWidth: 80,
      hide: isMobile && isTablet,
      render: (row) => row.userId || '-'
    },
    { 
      id: 'customerName', 
      label: 'Customer Name',
      width: 150,
      minWidth: 120,
      render: (row) => row.customerName || '-'
    },
    { 
      id: 'address', 
      label: 'Address',
      width: 250,
      minWidth: 200,
      hide: isMobile,
      render: (row) => row.address || '-'
    },
    { 
      id: 'status', 
      label: 'Status',
      width: 120,
      minWidth: 100,
      render: (row) => (
        <Chip 
          label={row.status} 
          color={
            row.status === 'Pending' ? 'warning' : 
            row.status === 'Accepted' ? 'success' : 
            row.status === 'Rejected' ? 'error' : 
            'default'
          }
          size={isMobile ? "small" : "medium"}
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 200,
      align: 'center',
      render: (row) => {
        if (row.status === 'Pending') {
          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant="contained"
                size="small"
                onClick={() => handleAccept(row.orderId)}
                disabled={approvingOrder === row.orderId}
                sx={{
                  bgcolor: '#4caf50',
                  '&:hover': {
                    bgcolor: '#388e3c'
                  },
                  minWidth: '70px',
                  height: '30px'
                }}
              >
                {approvingOrder === row.orderId ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  'Accept'
                )}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleReject(row.orderId)}
                disabled={approvingOrder === row.orderId}
                sx={{
                  bgcolor: '#f44336',
                  '&:hover': {
                    bgcolor: '#d32f2f'
                  },
                  minWidth: '70px',
                  height: '30px'
                }}
              >
                Reject
              </Button>
            </Stack>
          );
        }
        return null;
      }
    }
  ];

  const getTabLabel = (index) => {
    if (index === -1) return 'All Orders';
    switch(index) {
      case 0:
        return 'Today';
      case 1:
        return 'Yesterday';
      default:
        return format(subDays(new Date(), index), 'dd MMM yyyy');
    }
  };

  const filterDataByDate = (data, tabIndex) => {
    // If no data, return empty array to prevent errors
    if (!data || data.length === 0) {
      return [];
    }

    // If date range is selected, use that instead of tabs
    if (dateRange.from && dateRange.to) {
      // Ensure both dates are valid and create proper interval
      const start = startOfDay(new Date(dateRange.from));
      const end = startOfDay(new Date(dateRange.to));
      
      // Make sure we have a valid interval (start date is before or equal to end date)
      if (start > end) {
        return data; // Return all data if interval is invalid
      }

      return data.filter(order => {
        const orderDate = startOfDay(new Date(order.date));
        return orderDate >= start && orderDate <= end;
      });
    }

    // If All Orders tab is selected (-1), return all orders
    if (tabIndex === -1) {
      return data;
    }

    // For day-specific tabs
    try {
      const today = startOfDay(new Date());
      
      switch(tabIndex) {
        case 0: // Today
          return data.filter(order => {
            const orderDate = new Date(order.date);
            return isToday(orderDate);
          });
        case 1: // Yesterday
          return data.filter(order => {
            const orderDate = new Date(order.date);
            return isYesterday(orderDate);
          });
        default: // Other days
          const targetDate = startOfDay(subDays(today, tabIndex));
          return data.filter(order => {
            const orderDate = startOfDay(new Date(order.date));
            return orderDate.getTime() === targetDate.getTime();
          });
      }
    } catch (error) {
      console.error("Error filtering orders by date:", error);
      return data; // Return all data in case of error
    }
  };

  // Ensure we have data to display
  const filteredData = filterDataByDate(orders, activeTab);

  // Show loading state when users or vendors data is loading
  if ((usersLoading || vendorsLoading) && orders.length === 0) {
    return (
      <Box sx={{ p: 3, mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Debug log for filtered data
  console.log('Filtered Data:', filteredData);

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box /> {/* Empty box for spacing */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Export to CSV">
            <IconButton 
              onClick={exportToCSV}
              sx={{
                backgroundColor: '#E3F2FD',
                '&:hover': {
                  backgroundColor: '#BBDEFB',
                },
                width: 40,
                height: 40
              }}
            >
              <InsertDriveFile color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to PDF">
            <IconButton 
              onClick={exportToPDF}
              sx={{
                backgroundColor: '#FFEBEE',
                '&:hover': {
                  backgroundColor: '#FFCDD2',
                },
                width: 40,
                height: 40
              }}
            >
              <PictureAsPdf color="error" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to Excel">
            <IconButton 
              onClick={exportToExcel}
              sx={{
                backgroundColor: '#E8F5E9',
                '&:hover': {
                  backgroundColor: '#C8E6C9',
                },
                width: 40,
                height: 40
              }}
            >
              <GridOn color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Date Filter Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={dateRange.from}
              onChange={(newValue) => {
                setDateRange(prev => ({ ...prev, from: newValue }));
                setActiveTab(-1); // Deselect tabs when using date range
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="To Date"
              value={dateRange.to}
              onChange={(newValue) => {
                setDateRange(prev => ({ ...prev, to: newValue }));
                setActiveTab(-1); // Deselect tabs when using date range
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Stack>

        {/* Date Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            value={-1} 
            label="All Orders"
            icon={<ViewList fontSize="small" />}
            iconPosition="start"
          />
          {Array.from({ length: 7 }, (_, i) => (
            <Tab 
              key={i} 
              value={i}
              label={getTabLabel(i)}
              icon={i === 0 ? <CalendarToday fontSize="small" /> : null}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Orders Table */}
      <AnimatedTable
        columns={columns}
        data={filteredData}
        title={`Orders Table (${filteredData.length} orders)`}
      />
    </Box>
  );
};

export default OrdersScreen;