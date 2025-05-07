import React from 'react';
import { Box, Typography, IconButton, Stack, Tooltip } from '@mui/material';
import { GridOn } from '@mui/icons-material';
import AnimatedTable from './AnimatedTable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const PaymentsScreen = () => {
  const columns = [
    { id: 'slNo', label: 'Sl No' },
    { id: 'paymentId', label: 'Payment ID' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'paymentAmount', label: 'Payment Amount', align: 'right' },
    { id: 'paymentMethod', label: 'Payment Method' },
    { id: 'paymentStatus', label: 'Payment Status' },
  ];

  // Sample data - replace with actual data from your backend
  const data = [
    {
      id: 1,
      slNo: 1,
      paymentId: 'PAY001',
      customerName: 'John Doe',
      paymentAmount: '₹2,499',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Completed',
    },
    {
      id: 2,
      slNo: 2,
      paymentId: 'PAY002',
      customerName: 'Jane Smith',
      paymentAmount: '₹1,999',
      paymentMethod: 'UPI',
      paymentStatus: 'Pending',
    },
    {
      id: 3,
      slNo: 3,
      paymentId: 'PAY003',
      customerName: 'Rajesh Kumar',
      paymentAmount: '₹3,499',
      paymentMethod: 'Net Banking',
      paymentStatus: 'Completed',
    },
    {
      id: 4,
      slNo: 4,
      paymentId: 'PAY004',
      customerName: 'Priya Sharma',
      paymentAmount: '₹1,499',
      paymentMethod: 'Debit Card',
      paymentStatus: 'Failed',
    },
    {
      id: 5,
      slNo: 5,
      paymentId: 'PAY005',
      customerName: 'Amit Patel',
      paymentAmount: '₹4,999',
      paymentMethod: 'Credit Card',
      paymentStatus: 'Completed',
    },
  ];

  // Export to Excel function
  const exportToExcel = () => {
    const excelData = data.map(payment => ({
      'Sl No': payment.slNo,
      'Payment ID': payment.paymentId,
      'Customer Name': payment.customerName,
      'Payment Amount': payment.paymentAmount,
      'Payment Method': payment.paymentMethod,
      'Payment Status': payment.paymentStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    
    // Generate filename with current date
    const fileName = `payments_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Payments
        </Typography>
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
      <AnimatedTable
        columns={columns}
        data={data}
        title="Payments Table"
      />
    </Box>
  );
};

export default PaymentsScreen; 