import React, { useState, useEffect } from 'react';
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
  useTheme,
  useMediaQuery,
  Typography
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
import axios from 'axios';

const formatIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatter.replace('INR', '₹').replace('₹ ', '₹');
};

const VendorOrders = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [activeTab, setActiveTab] = useState(-1); // -1 = All Orders
  const [actionLoading, setActionLoading] = useState({}); // { [orderId]: true/false }

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('vendorToken');
        if (!token) throw new Error('No authentication token found');
        const response = await axios.get('https://api.boldeats.in/api/daily-orders/vendor/daily-orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setOrders(response.data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Accept/Reject handlers (API call)
  const handleOrderStatusChange = async (orderId, newStatus) => {
    setActionLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      const token = localStorage.getItem('vendorToken');
      if (!token) throw new Error('No authentication token found');
      await axios.patch(
        `https://api.boldeats.in/api/daily-orders/vendor/daily-orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setOrders(prev => prev.map(order => order.id === orderId ? { ...order, status: newStatus } : order));
    } catch (err) {
      alert('Failed to update order status: ' + (err.response?.data?.message || err.message));
    } finally {
      setActionLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  // Table columns
  const columns = [
    {
      id: 'orderId',
      label: 'Order ID',
      width: 120,
      minWidth: 100,
      render: (row) => `ORD${row.id.toString().padStart(3, '0')}`
    },
    {
      id: 'userId',
      label: 'User ID',
      width: 100,
      minWidth: 80,
      hide: isMobile && isTablet,
      render: (row) => row.DailyOrderSubscription?.userId ? `USER${row.DailyOrderSubscription.userId.toString().padStart(3, '0')}` : '-'
    },
    {
      id: 'customerName',
      label: 'Customer Name',
      width: 150,
      minWidth: 120,
      render: (row) => row.DailyOrderSubscription?.Subscriber?.name || '-'
    },
    {
      id: 'address',
      label: 'Address',
      width: 200,
      minWidth: 150,
      hide: isMobile,
      render: (row) => {
        const addr = row.DailyOrderSubscription?.Subscriber?.Addresses?.[0];
        if (!addr) return '-';
        return `${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
      }
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
          size={isMobile ? 'small' : 'medium'}
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 200,
      minWidth: 150,
      align: 'center',
      render: (row) => {
        if (row.status === 'Pending') {
          return (
            <Stack direction={isMobile ? 'column' : 'row'} spacing={1} justifyContent="center">
              <Button
                variant="contained"
                size={isMobile ? 'small' : 'medium'}
                onClick={() => handleOrderStatusChange(row.id, 'Accepted')}
                sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' }, minWidth: isMobile ? '60px' : '70px', height: isMobile ? '24px' : '30px' }}
                disabled={!!actionLoading[row.id]}
              >
                {actionLoading[row.id] ? <CircularProgress size={18} color="inherit" /> : 'Accept'}
              </Button>
              <Button
                variant="contained"
                size={isMobile ? 'small' : 'medium'}
                onClick={() => handleOrderStatusChange(row.id, 'Rejected')}
                sx={{ bgcolor: '#f44336', '&:hover': { bgcolor: '#d32f2f' }, minWidth: isMobile ? '60px' : '70px', height: isMobile ? '24px' : '30px' }}
                disabled={!!actionLoading[row.id]}
              >
                {actionLoading[row.id] ? <CircularProgress size={18} color="inherit" /> : 'Reject'}
              </Button>
            </Stack>
          );
        }
        return null;
      }
    }
  ].filter(col => !col.hide);

  // Tabs and date filter logic
  const getTabLabel = (index) => {
    if (index === -1) return 'All Orders';
    switch (index) {
      case 0: return 'Today';
      case 1: return 'Yesterday';
      default: return format(subDays(new Date(), index), 'dd MMM yyyy');
    }
  };

  const filterDataByDate = (data, tabIndex) => {
    if (!data || data.length === 0) return [];
    if (dateRange.from && dateRange.to) {
      const start = startOfDay(new Date(dateRange.from));
      const end = startOfDay(new Date(dateRange.to));
      if (start > end) return data;
      return data.filter(order => {
        const orderDate = startOfDay(new Date(order.date));
        return orderDate >= start && orderDate <= end;
      });
    }
    if (tabIndex === -1) return data;
    try {
      const today = startOfDay(new Date());
      switch (tabIndex) {
        case 0:
          return data.filter(order => isToday(new Date(order.date)));
        case 1:
          return data.filter(order => isYesterday(new Date(order.date)));
        default:
          const targetDate = startOfDay(subDays(today, tabIndex));
          return data.filter(order => startOfDay(new Date(order.date)).getTime() === targetDate.getTime());
      }
    } catch {
      return data;
    }
  };

  const filteredData = filterDataByDate(orders, activeTab);

  // Export functions (CSV, PDF, Excel) - unchanged, but map real data
  const exportToCSV = () => {
    const csvData = filteredData.map(order => ({
      'Order ID': `ORD${order.id.toString().padStart(3, '0')}`,
      'User ID': order.DailyOrderSubscription?.userId ? `USER${order.DailyOrderSubscription.userId.toString().padStart(3, '0')}` : '-',
      'Customer Name': order.DailyOrderSubscription?.Subscriber?.name || '-',
      'Address': (() => {
        const addr = order.DailyOrderSubscription?.Subscriber?.Addresses?.[0];
        if (!addr) return '-';
        return `${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
      })(),
      'Status': order.status,
      'Date': format(new Date(order.date), 'dd/MM/yyyy')
    }));
    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'vendor_orders.csv');
  };
  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.addFont('https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxP.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    const tableColumn = ['Order ID', 'User ID', 'Customer', 'Address', 'Status', 'Date'];
    const tableRows = filteredData.map(order => [
      `ORD${order.id.toString().padStart(3, '0')}`,
      order.DailyOrderSubscription?.userId ? `USER${order.DailyOrderSubscription.userId.toString().padStart(3, '0')}` : '-',
      order.DailyOrderSubscription?.Subscriber?.name || '-',
      (() => {
        const addr = order.DailyOrderSubscription?.Subscriber?.Addresses?.[0];
        if (!addr) return '-';
        return `${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
      })(),
      order.status,
      format(new Date(order.date), 'dd/MM/yyyy')
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: { font: 'Roboto', fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 11, fontStyle: 'bold' }
    });
    doc.save(`vendor_orders_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };
  const exportToExcel = () => {
    const excelData = filteredData.map(order => ({
      'Order ID': `ORD${order.id.toString().padStart(3, '0')}`,
      'User ID': order.DailyOrderSubscription?.userId ? `USER${order.DailyOrderSubscription.userId.toString().padStart(3, '0')}` : '-',
      'Customer Name': order.DailyOrderSubscription?.Subscriber?.name || '-',
      'Address': (() => {
        const addr = order.DailyOrderSubscription?.Subscriber?.Addresses?.[0];
        if (!addr) return '-';
        return `${addr.addressLine1 || ''}${addr.addressLine2 ? ', ' + addr.addressLine2 : ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
      })(),
      'Status': order.status,
      'Date': format(new Date(order.date), 'dd/MM/yyyy')
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'vendor_orders.xlsx');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box sx={{ p: 3, mt: 8, display: 'flex', justifyContent: 'center' }}>
        <Typography color="error" variant="h6">Error: {error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, mt: { xs: 7, sm: 8 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: { xs: 2, sm: 3 } }} spacing={2}>
        <Box />
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, justifyContent: { xs: 'center', sm: 'flex-end' } }}>
          <Tooltip title="Export to CSV">
            <IconButton onClick={exportToCSV} sx={{ backgroundColor: '#E3F2FD', '&:hover': { backgroundColor: '#BBDEFB' }, width: { xs: 35, sm: 40 }, height: { xs: 35, sm: 40 } }}>
              <InsertDriveFile color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to PDF">
            <IconButton onClick={exportToPDF} sx={{ backgroundColor: '#FFEBEE', '&:hover': { backgroundColor: '#FFCDD2' }, width: { xs: 35, sm: 40 }, height: { xs: 35, sm: 40 } }}>
              <PictureAsPdf color="error" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to Excel">
            <IconButton onClick={exportToExcel} sx={{ backgroundColor: '#E8F5E9', '&:hover': { backgroundColor: '#C8E6C9' }, width: { xs: 35, sm: 40 }, height: { xs: 35, sm: 40 } }}>
              <GridOn color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      {/* Date Filter Section */}
      <Paper sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={dateRange.from}
              onChange={(newValue) => { setDateRange(prev => ({ ...prev, from: newValue })); setActiveTab(-1); }}
              slotProps={{ textField: { size: isMobile ? 'small' : 'medium', fullWidth: isMobile } }}
            />
            <DatePicker
              label="To Date"
              value={dateRange.to}
              onChange={(newValue) => { setDateRange(prev => ({ ...prev, to: newValue })); setActiveTab(-1); }}
              slotProps={{ textField: { size: isMobile ? 'small' : 'medium', fullWidth: isMobile } }}
            />
          </LocalizationProvider>
        </Stack>
        {/* Date Tabs */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => { setActiveTab(v); setDateRange({ from: null, to: null }); }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider', '.MuiTab-root': { fontSize: { xs: '0.75rem', sm: '0.875rem' }, minHeight: { xs: 40, sm: 48 }, padding: { xs: '6px 12px', sm: '12px 16px' } } }}
        >
          <Tab value={-1} label="All Orders" icon={<ViewList fontSize={isMobile ? 'small' : 'medium'} />} iconPosition="start" />
          {Array.from({ length: 7 }, (_, i) => (
            <Tab key={i} value={i} label={getTabLabel(i)} icon={i === 0 ? <CalendarToday fontSize={isMobile ? 'small' : 'medium'} /> : null} iconPosition="start" />
          ))}
        </Tabs>
      </Paper>
      {/* Orders Table */}
      <AnimatedTable
        columns={columns}
        data={filteredData}
        title={`Orders Table (${filteredData.length} orders)`}
        sx={{ '& .MuiTableCell-root': { padding: { xs: '8px', sm: '16px' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
      />
    </Box>
  );
};

export default VendorOrders;